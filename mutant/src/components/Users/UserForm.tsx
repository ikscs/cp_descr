import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FieldArray, type FormikProps } from 'formik';
import * as Yup from 'yup';
import { type User } from '../../api/fetchUsers';
import { fetchRoles } from '../../api/fetchRoles';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
  InputAdornment,
  Stack,
  OutlinedInput,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { fetchUserById } from '../../api/fetchUserById';
import { apiKey } from '../../globals_VITE';

interface UserFormProps {
  user?: User;
  onSave: (values: User) => void;
  onCancel: () => void;
  tenantId: string;
  title?: string;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel, tenantId, title = 'Форма пользователя' }) => {
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles();
        setAvailableRoles(roles);
      } catch (err) {
        console.error('Error fetching roles:', err);
      }
    };

    loadRoles();

    const _fetchUserData = async () => {
      const fullUserData: any = await fetchUserById(tenantId, apiKey, 5);
      console.log('Full user data:', fullUserData);
    }
    _fetchUserData(); // debug
  }, []);

  const initialValues: User = user || {
    username: '',
    name: '',
    email: '',
    authorization: { [tenantId]: { roles: [] } },
    userId: 0,
  };

  const validationSchema = Yup.object({
    username: Yup.string().required('Обязательно').matches(/^[a-zA-Z0-9_-]+$/, 'Имя пользователя должно состоять из букв, цифр, дефисов или подчеркиваний'),
    name: Yup.string(),
    email: Yup.string().email('Некорректный email').required('Обязательно'),
    password: user
      ? Yup.string().min(6, 'Пароль должен быть не менее 6 символов').optional()
      : Yup.string().min(6, 'Пароль должен быть не менее 6 символов').required('Обязательно'),
    userId: Yup.number().required('Обязательно'),
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => onSave(values)}
    >
      {(formikProps: FormikProps<User>) => {
        const { values } = formikProps;
        return (
          <Form>
            <Typography variant="h6" gutterBottom>{title}</Typography>
            <Typography variant="h6" gutterBottom>{tenantId}</Typography>
            <Stack spacing={2}>
              <Field name="userId">
                {({ field, meta }: { field: any; meta: any }) => (
                  <TextField
                    {...field}
                    fullWidth
                    id="userId"
                    type="number"
                    label="ID пользователя"
                    variant="outlined"
                    margin="normal"
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                )}
              </Field>
              <Field name="username">
                {({ field, meta }: { field: any; meta: any }) => (
                  <TextField
                    {...field}
                    fullWidth
                    id="username"
                    label="Имя пользователя"
                    variant="outlined"
                    margin="normal"
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                )}
              </Field>
              <Field name="name">
                {({ field, meta }: { field: any; meta: any }) => (
                  <TextField
                    {...field}
                    fullWidth
                    id="name"
                    label="Имя"
                    variant="outlined"
                    margin="normal"
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                )}
              </Field>
              <Field name="email">
                {({ field, meta }: { field: any; meta: any }) => (
                  <TextField
                    {...field}
                    fullWidth
                    id="email"
                    type="email"
                    label="Email"
                    variant="outlined"
                    margin="normal"
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                )}
              </Field>
              <Field name="password">
                {({ field, meta }: { field: any; meta: any }) => (
                  <FormControlLabel
                    control={
                      <OutlinedInput
                        {...field}
                        fullWidth
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        label="Пароль"
                        margin="normal"
                        error={meta.touched && !!meta.error}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              edge="end"
                            >
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    }
                    label=""
                  />
                )}
              </Field>
              <Typography variant="subtitle1">Роли:</Typography>
              <Box sx={{ ml: 2 }}>
                <FieldArray name={`authorization.${tenantId}.roles`}>
                  {({ push, remove }) => (
                    <div>
                      {availableRoles.map((role) => (
                        <FormControlLabel
                          key={role}
                          control={
                            <Checkbox
                              checked={values.authorization?.[tenantId]?.roles?.includes(role)}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                if (e.target.checked) {
                                  push(role);
                                } else {
                                  const index = values.authorization?.[tenantId]?.roles?.indexOf(role);
                                  if (index !== -1) {
                                    remove(index);
                                  }
                                }
                              }}
                            />
                          }
                          label={role}
                        />
                      ))}
                    </div>
                  )}
                </FieldArray>
              </Box>
            </Stack>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={onCancel} sx={{ mr: 1 }}>Отмена</Button>
              <Button type="submit" variant="contained">Записать</Button>
            </Box>
          </Form>
        );
      }}
    </Formik>
  );
};

export default UserForm;
