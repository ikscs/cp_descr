// d:\dvl\ikscs\react\vp-descr\mui-uf-admin2\src\pages\Reports\QueryParam.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  // type SelectChangeEvent,
} from '@mui/material';
//import { Report } from '../../api/data/reportTools';
import { fetchData, getBackend } from '../../api/data/fetchData'; // For db_select
import { type ParsedReport } from './ReportList';
import { t } from 'i18next';

export interface QueryParamProps {
  report: ParsedReport;
  onExecute: (params: { name: string; value: string | number | boolean }[], showAsChart: boolean) => void;
  onClose: () => void;
  initialParams?: { name: string; value: string | number | boolean }[];
  initialShowAsChart?: boolean;
  reportContext?: { [key: string]: number | null | undefined }; // Add reportContext prop
  onSaveParams?: (params: { name: string; value: string | number | boolean }[]) => void; 
}

const backend = getBackend(); // For db_select

export interface Parameter {
  name: string;
  description: string;
  type: 'string' | 'number' | 'select' | 'boolean' | 'datetime' | 'date' | 'db_select';
  value: string | number | boolean;
  required: boolean;
  options?: string[]; // For select type
  optionsQuery?: string; // For db_select type
}

interface DbSelectOption {
  value: string | number;
  label: string;
}

const QueryParam: React.FC<QueryParamProps> = ({ report, onExecute, onClose, initialParams, initialShowAsChart, reportContext, onSaveParams }) => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [dbSelectOptions, setDbSelectOptions] = useState<{ [paramName: string]: DbSelectOption[] }>({});
  const [dbSelectLoading, setDbSelectLoading] = useState<{ [paramName: string]: boolean }>({});
  const [dbSelectError, setDbSelectError] = useState<{ [paramName: string]: string | null }>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [showAsChart, setShowAsChart] = useState<boolean>(false);

  useEffect(() => {
    // Initialize parameters based on report.config
    // const config = report.config ? JSON.parse(report.config) : null;
    const config = report.config
    if (config && config.params) {
      const initialParamsFromConfig = config.params.map((param: any) => ({
        name: param.name,
        description: param.description,
        type: param.type,
        value:
          param.type === 'number'
            ? 0
            : param.type === 'boolean'
            ? false
            : '', // Default values
        required: param.required || false,
        options: param.selectOptions,
        optionsQuery: param.optionsQuery, // Add optionsQuery
      }));

      if (initialParams && initialParams.length > 0) {
        const mergedParams = initialParamsFromConfig.map((paramFromConfig) => {
          const matchingParam = initialParams.find(
            (param) => param.name === paramFromConfig.name
          );
          return matchingParam
            ? { ...paramFromConfig, value: matchingParam.value }
            : paramFromConfig;
        });
        setParameters(mergedParams);
      } else {
        setParameters(initialParamsFromConfig);
      }
    } else {
      setParameters([]);
    }
    if (initialShowAsChart !== undefined) {
      setShowAsChart(initialShowAsChart);
    }
  }, [report.config?.params, initialParams, initialShowAsChart]);

  useEffect(() => {
    parameters.forEach(async (param) => {
      if (param.type === 'db_select' && param.optionsQuery && !dbSelectOptions[param.name]) {
        setDbSelectLoading(prev => ({ ...prev, [param.name]: true }));
        setDbSelectError(prev => ({ ...prev, [param.name]: null }));
        try {
          let finalQuery = param.optionsQuery;

          // --- Apply Context Substitution ---
          if (reportContext && typeof finalQuery === 'string') {
            for (const key in reportContext) {
              if (Object.prototype.hasOwnProperty.call(reportContext, key)) {
                // const placeholder = `:${key}`;
                const value = reportContext[key];
                let replacementValue: string; 

                // Given reportContext values are typed as number | null | undefined
                if (value === null || value === undefined) {
                  // NULL should be inserted as a keyword, no quotes
                  replacementValue = 'NULL';
                } else { // value is a number (this includes NaN, which becomes "NaN")
                  // Numbers should be inserted directly without quotes
                  replacementValue = String(value);
                }

                // Use regex to replace :key only if it's not followed by another word character
                // This prevents replacing :customer in :customer_details if key is "customer".
                const regex = new RegExp(`:${key}(?![a-zA-Z0-9_])`, 'g');
                finalQuery = finalQuery.replace(regex, replacementValue);
              }
            }
          }
          // --- End Context Substitution ---

          const queryResult: any = await fetchData({
            backend_point: backend.backend_point_query,
            query: finalQuery, // Use the processed query
            // Potentially add app_id or other context if needed by the backend
          });

          if (queryResult && Array.isArray(queryResult.data)) {
            const fetchedOptions: DbSelectOption[] = queryResult.data.map((row: any) => {
              if (Array.isArray(row) && row.length >= 2) {
                return { value: row[0], label: String(row[1]) };
              } else if (typeof row === 'object' && row !== null && 'value' in row && 'label' in row) {
                return { value: row.value, label: String(row.label) };
              }
              console.warn(`Invalid row format for db_select options for param "${param.name}":`, row);
              return null;
            }).filter((opt: any): opt is DbSelectOption => opt !== null);
            setDbSelectOptions(prev => ({ ...prev, [param.name]: fetchedOptions }));
          } else {
            throw new Error('Invalid data format received for db_select options.');
          }
        } catch (error: any) {
          console.error(`Error fetching db_select options for ${param.name}:`, error);
          setDbSelectError(prev => ({ ...prev, [param.name]: error.message || 'Failed to load options' }));
          setDbSelectOptions(prev => ({ ...prev, [param.name]: [] })); // Set empty on error
        } finally {
          setDbSelectLoading(prev => ({ ...prev, [param.name]: false }));
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameters, reportContext]); // Add reportContext to dependencies

  const handleParamChange = (
    index: number,
    newValue: string | number | boolean
  ) => {
    const updatedParams = [...parameters];
    updatedParams[index].value = newValue;
    setParameters(updatedParams);
    // Clear validation error when the value changes
    setValidationErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[updatedParams[index].name];
      return newErrors;
    });
  };

  const validateParams = (): boolean => {
    let isValid = true;
    const errors: { [key: string]: string } = {};

    parameters.forEach((param) => {
      const RequiredField = t('Common.RequiredField');
      if (param.required) {
        if (
          param.type === 'string' &&
          (param.value === null || param.value === undefined || param.value === '')
        ) {
          errors[param.name] = RequiredField;
          isValid = false;
        } else if (
          param.type === 'number' &&
          (param.value === null || param.value === undefined || param.value.toString() === '')
        ) {
          errors[param.name] = RequiredField;
          isValid = false;
        } else if (
          param.type === 'select' &&
          (param.value === null || param.value === undefined || param.value === '')
        ) {
          errors[param.name] = RequiredField;
          isValid = false;
        } else if (
          param.type === 'date' &&
          (param.value === null || param.value === undefined || param.value === '')
        ) {
          errors[param.name] = RequiredField;
          isValid = false;
        } else if (
          param.type === 'db_select' &&
          (param.value === null || param.value === undefined || param.value === '')
        ) {
          errors[param.name] = RequiredField;
          isValid = false;
        }
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleExecute = async () => {
    if (!validateParams()) {
      return;
    }

    try {
      // Changed to create an array of { name, value } objects
      const paramValues: { name: string; value: string | number | boolean }[] = parameters.map(
        (param) => ({
          name: param.name,
          value: param.value,
        })
      );
      onExecute(paramValues, showAsChart);
    } catch (error) {
      console.error('Помилка виконання звіту з параметрами:', error);
    }
  };

  const handleParamSave = async () => {
    if (!validateParams()) {
      return;
    }
    if (onSaveParams) {
      // onSaveParams([{name: 'aa', value: 'bb'}]);
      onSaveParams(parameters);
    }
  }
  return (
    <Box mt={2}>
      {parameters.length === 0 ? (
        // <Typography>Звіт не має параметрів</Typography>
        <Typography>{t('QueryParam.noParams')}</Typography>
      ) : (
        <Grid container spacing={2}>
          {parameters.map((param, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <FormControl fullWidth error={!!validationErrors[param.name]}>
                {param.type === 'string' && (
                  <TextField
                    label={param.description || param.name}
                    type="text"
                    value={param.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleParamChange(index, e.target.value)}
                    variant="outlined"
                    required={param.required}
                    helperText={validationErrors[param.name]}
                  />
                )}
                {param.type === 'number' && (
                  <TextField
                    label={param.description || param.name}
                    type="number"
                    value={param.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleParamChange(index, Number(e.target.value))
                    }
                    variant="outlined"
                    required={param.required}
                    helperText={validationErrors[param.name]}
                  />
                )}
                {param.type === 'select' && (
                  <>
                    <InputLabel id={`select-label-${index}`}>
                      {param.description || param.name}
                    </InputLabel>
                    <Select
                      labelId={`select-label-${index}`}
                      label={param.description || param.name}
                      value={param.value}
                      onChange={(e: any) =>
                        handleParamChange(index, e.target.value as string)
                      }
                      variant="outlined"
                      required={param.required}
                    >
                      {param.options?.map((option, optionIndex) => (
                        <MenuItem key={optionIndex} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    {validationErrors[param.name] && (
                      <FormHelperText>{validationErrors[param.name]}</FormHelperText>
                    )}
                  </>
                )}
                {param.type === 'boolean' && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={param.value as boolean}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleParamChange(index, e.target.checked)
                        }
                      />
                    }
                    label={param.description || param.name}
                  />
                )}
                {param.type === 'date' && (
                  <TextField
                    label={param.description || param.name}
                    type="date"
                    value={param.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleParamChange(index, e.target.value)}
                    variant="outlined"
                    required={param.required}
                    helperText={validationErrors[param.name]}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
                {param.type === 'db_select' && (
                  <>
                    <InputLabel id={`db-select-label-${index}`}>
                      {param.description || param.name}
                    </InputLabel>
                    <Select
                      labelId={`db-select-label-${index}`}
                      label={param.description || param.name}
                      value={param.value}
                      onChange={(e: any) =>
                        handleParamChange(index, e.target.value as string)
                      }
                      variant="outlined"
                      required={param.required}
                      disabled={dbSelectLoading[param.name]}
                    >
                      {dbSelectLoading[param.name] && (
                        <MenuItem value="" disabled><em>Завантаження...</em></MenuItem>
                      )}
                      {dbSelectError[param.name] && (
                        <MenuItem value="" disabled><em>Помилка завантаження</em></MenuItem>
                      )}
                      {!dbSelectLoading[param.name] && !dbSelectError[param.name] && (dbSelectOptions[param.name] || []).map((option, optionIndex) => (
                        <MenuItem key={optionIndex} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {(validationErrors[param.name] || dbSelectError[param.name]) && (
                      <FormHelperText>{validationErrors[param.name] || dbSelectError[param.name]}</FormHelperText>
                    )}
                  </>
                )}
              </FormControl>
            </Grid>
          ))}
        </Grid>
      )}
      <Box mt={2} display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={showAsChart}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowAsChart(e.target.checked)}
            />
          }
          // label="графік"
          label={t('QueryParam.showAsChart')}
          sx={{ marginRight: 'auto' }} // Pushes buttons to the right
        />

        {/* <Button onClick={handleParamChange}>
          {t('QueryParam.saveParam')}
        </Button>  */}

        {onSaveParams && (
        <Button onClick={handleParamSave}>
          {t('QueryParam.saveParaml')}
        </Button>
        )}

        <Button onClick={onClose}>
          {/* Скасувати */}
          {t('QueryParam.cancel')}
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleExecute}
          id="query-param-execute-button"
        >
          {/* Виконати з параметрами */}
          {t('QueryParam.execute')}
        </Button>
      </Box>
    </Box>
  );
};

export default QueryParam;
