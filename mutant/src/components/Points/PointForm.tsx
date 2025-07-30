// src/components/Points/PointForm.tsx
import React from 'react';
import { Formik, Form, Field, } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
} from '@mui/material';

// Тип для значений формы, может немного отличаться от Point, если ID генерируется на сервере
export interface PointFormValues {
  point_id?: number;
  name: string;
  country: string;
  city: string;
  tag?: string; // (optional) тег для точки учета
  start_time: string;
  end_time: string;
}

export interface PointFormDefaults {
  country: string;
  city: string;
}

interface PointFormProps {
  point?: PointFormValues; // Данные точки для редактирования
  defaults?: PointFormDefaults; // Данные по умолчанию
  onSave: (values: PointFormValues) => void;
  onCancel: () => void;
  title?: string;
}

const PointForm: React.FC<PointFormProps> = ({
  point,
  defaults,
  onSave,
  onCancel,
  title = 'Форма точки',
}) => {
  const initialValues: PointFormValues = point || {
    name: '',
    country: defaults?.country || 'Україна',
    city: defaults?.city || 'Київ',
    tag: '', // Optional field
    start_time: '',
    end_time: '',
  };

  // Регулярное выражение для проверки формата времени HH:MM
  // const timeRegex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;

  // Регулярное выражение для проверки формата времени HH:MM:SS
  const timeRegex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]$/;

  const validationSchema = Yup.object({
    name: Yup.string().required('Обязательно'),
    description: Yup.string().optional(),
    tag: Yup.string().optional(),
    start_time: Yup.string()
      .matches(timeRegex, 'Время должно быть в формате HH:MM:SS')
      .required('Обязательно'),
    end_time: Yup.string()
      .matches(timeRegex, 'Время должно быть в формате HH:MM:SS')
      .required('Обязательно')
      .test(
        'is-after-start',
        'Время окончания должно быть позже времени начала',
        function (end_time) {
          const { start_time } = this.parent;
          if (!start_time || !end_time) {
            return true;
          }
          const [startHour, startMinute] = start_time.split(':').map(Number);
          const [endHour, endMinute] = end_time.split(':').map(Number);

          if (endHour < startHour) {
            return false;
          }
          if (endHour === startHour && endMinute <= startMinute) {
            return false;
          }
          return true;
        }
      ),
  });

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        onSave(values);
      }}
      enableReinitialize // Позволяет форме реинициализироваться при изменении 'point'
    >
      {(/*formikProps: FormikProps<PointFormValues>*/) => (
        <Form>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Stack spacing={2}>
            <Field name="name">
              {({ field, meta }: { field: any; meta: any }) => (
                <TextField
                  {...field}
                  fullWidth
                  id="name"
                  label="Назва"
                  variant="outlined"
                  margin="normal"
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            <Field name="country">
              {({ field, meta }: { field: any; meta: any }) => (
                <TextField
                  {...field}
                  fullWidth
                  id="country"
                  label="Країна"
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={1} // Changed to 1 row for country
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            <Field name="city">
              {({ field, meta }: { field: any; meta: any }) => (
                <TextField
                  {...field}
                  fullWidth
                  id="city"
                  label="Місто"
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={1} // Changed to 1 row for city
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            <Field name="tag">
              {({ field, meta }: { field: any; meta: any }) => (
                <TextField
                  {...field}
                  fullWidth
                  id="tag"
                  label="Тег (необязательно)"
                  variant="outlined"
                  margin="normal"
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            <Field name="start_time">
              {({ field, meta }: { field: any; meta: any }) => (
                <TextField
                  {...field}
                  fullWidth
                  id="start_time"
                  label="Время начала (HH:MM:SS)"
                  variant="outlined"
                  margin="normal"
                  placeholder="HH:MM:SS"
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            <Field name="end_time">
              {({ field, meta }: { field: any; meta: any }) => (
                <TextField
                  {...field}
                  fullWidth
                  id="end_time"
                  label="Время окончания (HH:MM:SS)"
                  variant="outlined"
                  margin="normal"
                  placeholder="HH:MM:SS"
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
          </Stack>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel} sx={{ mr: 1 }}>
              Отмена
            </Button>
            <Button type="submit" variant="contained">
              Записать
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default PointForm;