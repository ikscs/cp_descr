import React from 'react';
import { Formik, Form, Field, type FieldProps } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  FormHelperText,
} from '@mui/material';

export interface JsonFormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'json';
  defaultValue?: any;
  placeholder?: string;
  options?: Array<{ value: string | number; label: string }>;
  validation?: {
    required?: boolean | string;
    minLength?: number | [number, string];
    maxLength?: number | [number, string];
    email?: boolean | string;
    pattern?: [RegExp, string];
    min?: number | [number, string];
    max?: number | [number, string];
    integer?: boolean | string;
    positive?: boolean | string;
    isJson?: boolean | string;
  };
  muiProps?: Record<string, any>;
  formControlLabelProps?: Record<string, any>;
}

export interface JsonFormTemplate {
  fields: JsonFormField[];
}

export interface JsonFormProps {
  template: JsonFormTemplate;
  initialData: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  title?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
}

const getInitialValue = (field: JsonFormField, data: Record<string, any>): any => {
  if (data.hasOwnProperty(field.name)) {
    return data[field.name];
  }
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'select': // Assuming string value for select by default
    case 'json':
      return '';
    case 'number':
      return ''; // Formik handles empty string for type="number" input, Yup coerces
    case 'boolean':
      return false;
    default:
      return undefined;
  }
};

const JsonForm: React.FC<JsonFormProps> = ({
  template,
  initialData,
  onSubmit,
  onCancel,
  title,
  submitButtonText = 'Сохранить',
  cancelButtonText = 'Отмена',
}) => {
  const initialValues: Record<string, any> = {};
  template.fields.forEach(field => {
    initialValues[field.name] = getInitialValue(field, initialData);
  });

  const validationSchema = Yup.object().shape(
    template.fields.reduce((schema, field) => {
      let fieldSpecificSchema!: Yup.AnySchema; // Definite assignment due to switch-default

      switch (field.type) {
        case 'number':
          {
            let numSchema = Yup.number().typeError('Должно быть числом');
            if (field.validation?.min !== undefined) {
              const min = field.validation.min;
              numSchema = numSchema.min(
                Array.isArray(min) ? min[0] : min,
                Array.isArray(min) ? min[1] : 'Слишком маленькое значение'
              );
            }
            if (field.validation?.max !== undefined) {
              const max = field.validation.max;
              numSchema = numSchema.max(
                Array.isArray(max) ? max[0] : max,
                Array.isArray(max) ? max[1] : 'Слишком большое значение'
              );
            }
            if (field.validation?.integer) {
              numSchema = numSchema.integer(
                typeof field.validation.integer === 'string' ? field.validation.integer : 'Должно быть целым числом'
              );
            }
            if (field.validation?.positive) {
              numSchema = numSchema.positive(
                typeof field.validation.positive === 'string' ? field.validation.positive : 'Должно быть положительным числом'
              );
            }
            fieldSpecificSchema = numSchema;
          }
          break;
        case 'boolean':
          fieldSpecificSchema = Yup.boolean();
          break;
        case 'json':
        case 'text':
        case 'textarea':
        case 'select':
        default:
          {
            let strSchema = Yup.string();

            if (field.type === 'json' && field.validation?.isJson) {
              strSchema = strSchema.test(
                'is-json',
                typeof field.validation.isJson === 'string' ? field.validation.isJson : 'Некорректный JSON формат',
                (value) => {
                  if (!value || value.trim() === '') return true; // Allow empty string
                  try {
                    JSON.parse(value);
                    return true;
                  } catch (e) {
                    return false;
                  }
                }
              );
            }

            if (field.validation?.minLength !== undefined) {
              const minLength = field.validation.minLength;
              strSchema = strSchema.min( // Yup uses min for string length
                Array.isArray(minLength) ? minLength[0] : minLength,
                Array.isArray(minLength) ? minLength[1] : 'Слишком короткая строка'
              );
            }
            if (field.validation?.maxLength !== undefined) {
              const maxLength = field.validation.maxLength;
              strSchema = strSchema.max( // Yup uses max for string length
                Array.isArray(maxLength) ? maxLength[0] : maxLength,
                Array.isArray(maxLength) ? maxLength[1] : 'Слишком длинная строка'
              );
            }
            if (field.validation?.email) {
              strSchema = strSchema.email(
                typeof field.validation.email === 'string' ? field.validation.email : 'Некорректный email адрес'
              );
            }
            if (field.validation?.pattern) {
              strSchema = strSchema.matches(field.validation.pattern[0], field.validation.pattern[1]);
            }
            fieldSpecificSchema = strSchema;
          }
          break;
      }

      if (field.validation?.required) {
        fieldSpecificSchema = fieldSpecificSchema.required(
          typeof field.validation.required === 'string' ? field.validation.required : 'Это поле обязательно'
        );
      } else {
        // Allow field to be optional, for numbers this means they can be undefined/null if not required
        // For strings, empty string is usually the 'empty' state.
        fieldSpecificSchema = fieldSpecificSchema.nullable();
      }

      schema[field.name] = fieldSpecificSchema;
      return schema;
    }, {} as Record<string, Yup.AnySchema>)
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values, { setSubmitting }) => {
        onSubmit(values);
        // Parent component is responsible for actual async operations and managing submitting state beyond this.
        // For simplicity, Formik's isSubmitting will turn false after this sync onSubmit call.
        // If onSubmit prop is async, parent should handle its own loading state.
        setSubmitting(false); 
      }}
      enableReinitialize
    >
      {({ errors, touched, isSubmitting /*, values, setFieldValue */ }) => (
        <Form>
          {title && (
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
          )}
          <Stack spacing={2} sx={{ mt: title ? 2 : 0 }}>
            {template.fields.map((field) => {
              const error = touched[field.name] && !!errors[field.name];
              const helperText = touched[field.name] && errors[field.name] ? String(errors[field.name]) : field.placeholder;

              switch (field.type) {
                case 'text':
                case 'number':
                case 'textarea':
                case 'json':
                  return (
                    <Field key={field.name} name={field.name}>
                      {({ field: formikField }: FieldProps) => (
                        <TextField
                          {...formikField}
                          fullWidth
                          type={field.type === 'number' ? 'number' : 'text'}
                          label={field.label}
                          multiline={field.type === 'textarea' || field.type === 'json'}
                          rows={(field.type === 'textarea' || field.type === 'json') ? (field.muiProps?.rows || 3) : undefined}
                          error={error}
                          helperText={helperText}
                          {...field.muiProps}
                        />
                      )}
                    </Field>
                  );
                case 'select':
                  return (
                    <FormControl key={field.name} fullWidth error={error}>
                      <InputLabel id={`${field.name}-label`}>{field.label}</InputLabel>
                      <Field name={field.name}>
                        {({ field: formikField }: FieldProps) => (
                          <Select
                            {...formikField}
                            labelId={`${field.name}-label`}
                            label={field.label}
                            {...field.muiProps}
                          >
                            <MenuItem value=""><em>{(field.muiProps?.defaultLabel) || 'Выберите значение'}</em></MenuItem>
                            {field.options?.map(option => (
                              <MenuItem key={option.value.toString()} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      </Field>
                      {(error || (helperText && helperText !== field.label)) && (
                        <FormHelperText>{helperText}</FormHelperText>
                      )}
                    </FormControl>
                  );
                case 'boolean':
                  return (
                    <Field key={field.name} name={field.name} type="checkbox">
                      {({ field: formikField }: FieldProps) => (
                        <FormControlLabel
                          control={<Checkbox {...formikField} checked={formikField.value} />}
                          label={field.label}
                          {...field.formControlLabelProps}
                        />
                      )}
                    </Field>
                  );
                default:
                  return null;
              }
            })}
          </Stack>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            {onCancel && (
              <Button onClick={onCancel} sx={{ mr: 1 }} disabled={isSubmitting}>
                {cancelButtonText}
              </Button>
            )}
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : submitButtonText}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default JsonForm;