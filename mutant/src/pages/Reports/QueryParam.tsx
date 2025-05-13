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
  type SelectChangeEvent,
} from '@mui/material';
//import { Report } from '../../api/data/reportTools';
import { type ParsedReport } from './ReportList';

interface QueryParamProps {
  report: ParsedReport;
  onExecute: (params: { name: string; value: string | number | boolean }[], showAsChart: boolean) => void;
  onClose: () => void;
  initialParams?: { name: string; value: string | number | boolean }[];
  initialShowAsChart?: boolean;
}

export interface Parameter {
  name: string;
  description: string;
  type: 'string' | 'number' | 'select' | 'boolean' | 'datetime' | 'date';
  value: string | number | boolean;
  required: boolean;
  options?: string[]; // For select type
}

const QueryParam: React.FC<QueryParamProps> = ({ report, onExecute, onClose, initialParams, initialShowAsChart }) => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
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
      if (param.required) {
        if (
          param.type === 'string' &&
          (param.value === null || param.value === undefined || param.value === '')
        ) {
          errors[param.name] = 'Обов\'язкове поле';
          isValid = false;
        } else if (
          param.type === 'number' &&
          (param.value === null || param.value === undefined || param.value.toString() === '')
        ) {
          errors[param.name] = 'Обов\'язкове поле';
          isValid = false;
        } else if (
          param.type === 'select' &&
          (param.value === null || param.value === undefined || param.value === '')
        ) {
          errors[param.name] = 'Обов\'язкове поле';
          isValid = false;
        } else if (
          param.type === 'date' &&
          (param.value === null || param.value === undefined || param.value === '')
        ) {
          errors[param.name] = 'Обов\'язкове поле';
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

  return (
    <Box mt={2}>
      {parameters.length === 0 ? (
        <Typography>Звіт не має параметрів</Typography>
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
          label="графік"
          sx={{ marginRight: 'auto' }} // Pushes buttons to the right
        />
        <Button onClick={onClose}>Скасувати</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExecute}
        >
          Виконати з параметрами
        </Button>
      </Box>
    </Box>
  );
};

export default QueryParam;
