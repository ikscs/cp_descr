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
} from '@mui/material';
import { Report } from '../../api/data/reportTools';

interface QueryParamProps {
  report: Report;
  onExecute: (params: { name: string; value: string | number | boolean }[]) => void; // Changed onExecute type
  onClose: () => void;
}

export interface Parameter {
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'datetime';
  value: string | number | boolean;
  required: boolean;
  options?: string[]; // For select type
}

const QueryParam: React.FC<QueryParamProps> = ({ report, onExecute, onClose }) => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Initialize parameters based on report.config
    const config = report.config ? JSON.parse(report.config) : null;
    if (config && config.params) {
      const initialParams = config.params.map((param: any) => ({
        name: param.name,
        type: param.type,
        value:
          param.type === 'number'
            ? 0
            : param.type === 'boolean'
            ? false
            : '', // Default values
        required: param.required || false,
        options: param.options,
      }));
      setParameters(initialParams);
    } else {
      setParameters([]);
    }
  }, [report.params]);

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
          param.type === 'text' &&
          (param.value === null || param.value === undefined || param.value === '')
        ) {
          errors[param.name] = 'Обязательное поле';
          isValid = false;
        } else if (
          param.type === 'number' &&
          (param.value === null || param.value === undefined || param.value.toString() === '')
        ) {
          errors[param.name] = 'Обязательное поле';
          isValid = false;
        } else if (
          param.type === 'select' &&
          (param.value === null || param.value === undefined || param.value === '')
        ) {
          errors[param.name] = 'Обязательное поле';
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
      onExecute(paramValues);
    } catch (error) {
      console.error('Error executing report with parameters:', error);
    }
  };

  return (
    <Box mt={2}>
      {parameters.length === 0 ? (
        <Typography>Отчет не имеет параметров</Typography>
      ) : (
        <Grid container spacing={2}>
          {parameters.map((param, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <FormControl fullWidth error={!!validationErrors[param.name]}>
                {param.type === 'text' && (
                  <TextField
                    label={param.name}
                    type="text"
                    value={param.value}
                    onChange={(e) => handleParamChange(index, e.target.value)}
                    variant="outlined"
                    required={param.required}
                    helperText={validationErrors[param.name]}
                  />
                )}
                {param.type === 'number' && (
                  <TextField
                    label={param.name}
                    type="number"
                    value={param.value}
                    onChange={(e) =>
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
                      {param.name}
                    </InputLabel>
                    <Select
                      labelId={`select-label-${index}`}
                      label={param.name}
                      value={param.value}
                      onChange={(e) =>
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
                        onChange={(e) =>
                          handleParamChange(index, e.target.checked)
                        }
                      />
                    }
                    label={param.name}
                  />
                )}
              </FormControl>
            </Grid>
          ))}
        </Grid>
      )}
      <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
        <Button onClick={onClose}>Отмена</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExecute}
        >
          Выполнить с параметрами
        </Button>
      </Box>
    </Box>
  );
};

export default QueryParam;
