// src/components/Points/PointForm.tsx
import React from 'react';
// import { Formik, Form, Field, type FormikProps } from 'formik';
import { Formik, Form, Field, } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
} from '@mui/material';

// интерфейс для точки учета
// export interface Point {
//   id: number; // Используйте string, если ID не числовой
//   name: string;
//   description?: string;
//   country: string; // берем из customer
//   city: string; // берем из customer
//   // Добавьте другие поля по необходимости, например, координаты
//   // x?: number;
//   // y?: number;
// }

// Тип для значений формы, может немного отличаться от Point, если ID генерируется на сервере
export interface PointFormValues {
  point_id?: number;
  name: string;
  // description?: string;
  country: string;
  city: string;
  // x?: number;
  // y?: number;
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
    // description: '',
    country: defaults?.country || 'Україна',
    city: defaults?.city || 'Київ',
    // x: 0,
    // y: 0,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Обязательно'),
    description: Yup.string().optional(),
    // x: Yup.number().optional(),
    // y: Yup.number().optional(),
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
                  rows={3}
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
                  rows={3}
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            {/* Добавьте другие поля здесь, например, для координат */}
            {/*
            <Field name="x">
              {({ field, meta }: { field: any; meta: any }) => (
                <TextField
                  {...field}
                  fullWidth
                  id="x"
                  type="number"
                  label="Координата X"
                  variant="outlined"
                  margin="normal"
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            <Field name="y">
              {({ field, meta }: { field: any; meta: any }) => (
                <TextField
                  {...field}
                  fullWidth
                  id="y"
                  type="number"
                  label="Координата Y"
                  variant="outlined"
                  margin="normal"
                  error={meta.touched && !!meta.error}
                  helperText={meta.touched && meta.error}
                />
              )}
            </Field>
            */}
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
