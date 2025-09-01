// Перероблена форма з підтримкою i18n
// Re-written form with i18n support
// Formularz przepisany z obsługą i18n
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, type FormikProps, type FieldProps } from 'formik';
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
  CircularProgress,
  Modal,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { pointApi } from '../../api/data/pointApi';
import { useCustomer } from '../../context/CustomerContext';
import { originTypeApi, OriginTypeOption } from '../../api/data/originTypeApi';
import JsonForm, { type JsonFormTemplate } from '../common/JsonForm';

export interface OriginFormValues {
  id?: number;
  point_id: string | number;
  name: string;
  origin: string;
  origin_type_id: string | number;
  credentials?: string;
  is_enabled: boolean;
  poling_period_s?: number;
}

export interface OriginFormProps {
  originToEdit?: OriginFormValues;
  onSave: (values: OriginFormValues) => void;
  onCancel: () => void;
  lockPointId?: boolean;
}

const OriginForm: React.FC<OriginFormProps> = ({
  originToEdit,
  onSave,
  onCancel,
  lockPointId = false,
}) => {
  const { t } = useTranslation();
  const title = originToEdit ? t('OriginForm.Edit_Origin') : t('OriginForm.Add_New_Origin');
  const { customerData, isLoading: isCustomerLoading } = useCustomer();
  const [points, setPoints] = useState<Array<{ value: number | string; label: string }>>([]);
  const [originTypes, setOriginTypes] = useState<OriginTypeOption[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [dropdownError, setDropdownError] = useState<string | null>(null);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  const defaultCredentialsEditorTemplate: JsonFormTemplate = {
    fields: [
      {
        name: 'jsonString',
        label: t('OriginForm.Credentials_JSON'),
        type: 'json',
        validation: { isJson: true },
        muiProps: {
          multiline: true,
          rows: 10,
          placeholder: t('OriginForm.JSON_Placeholder'),
        },
      },
    ],
  };

  useEffect(() => {
    const loadDropdownData = async () => {
      setIsLoadingDropdowns(true);
      setDropdownError(null);

      if (isCustomerLoading) {
        return;
      }

      if (!customerData?.customer) {
        setPoints([]);
        setOriginTypes([]);
        setDropdownError(t('OriginForm.Select_Customer_Prompt'));
        setIsLoadingDropdowns(false);
        return;
      }

      try {
        const customerId = Number(customerData.customer);
        if (isNaN(customerId) || customerId <= 0) {
          setDropdownError(t('OriginForm.Invalid_Customer_ID'));
          setPoints([]);
          setOriginTypes([]);
          setIsLoadingDropdowns(false);
          return;
        }

        const [pointsData, originTypesData] = await Promise.all([
          pointApi.getPoints(),
          originTypeApi.getOriginTypes(),
        ]);

        const formattedPoints = pointsData.map(point => ({
          value: point.point_id,
          label: point.name,
        }));
        setPoints(formattedPoints as Array<{ value: number | string; label: string }>);
        setOriginTypes(originTypesData as OriginTypeOption[]);
      } catch (err) {
        console.error('[OriginForm] Error loading dropdown data:', err);
        const message = err instanceof Error ? err.message : t('OriginForm.Failed_to_load_dropdown_data');
        setDropdownError(message);
        setPoints([]);
        setOriginTypes([]);
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    loadDropdownData();
  }, [customerData?.customer, isCustomerLoading, t]);

  const initialValues: OriginFormValues = originToEdit || {
    name: '',
    point_id: '',
    origin: '',
    origin_type_id: '',
    credentials: '{}',
    is_enabled: true,
    poling_period_s: undefined,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required(t('OriginForm.Name_is_required')),
    point_id: Yup.number().required(t('OriginForm.Point_is_required')),
    origin: Yup.string().required(t('OriginForm.Origin_identifier_is_required')),
    origin_type_id: Yup.number().required(t('OriginForm.Origin_type_is_required')),
    credentials: Yup.string().test(
      'is-json',
      t('OriginForm.Credentials_must_be_valid_JSON'),
      (value) => {
        if (!value || value.trim() === '' || value.trim() === '{}') return true;
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          return false;
        }
      }
    ).optional(),
    is_enabled: Yup.boolean().required(),
    poling_period_s: Yup.number()
      .optional()
      .positive(t('OriginForm.Polling_period_must_be_positive'))
      .integer(t('OriginForm.Polling_period_must_be_integer')),
  });

  if (isLoadingDropdowns) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>{t('OriginForm.Loading_form_data')}</Typography>
      </Box>
    );
  }

  if (dropdownError) {
    return <Alert severity="error">{dropdownError}</Alert>;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        onSave(values);
      }}
      enableReinitialize
    >
      {(formikProps: FormikProps<OriginFormValues>) => {
        const { values, setFieldValue } = formikProps;

        const selectedOriginType = originTypes.find(
          (ot) => ot.value?.toString() === values.origin_type_id?.toString()
        );

        const currentCredentialsTemplate: JsonFormTemplate =
          selectedOriginType?.template || defaultCredentialsEditorTemplate;

        return (
          <Form>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Field name="name">
                {({ field, meta }: { field: any; meta: any }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('OriginForm.Name_Label')}
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                )}
              </Field>

              <Field name="point_id">
                {({ field, meta }: { field: any; meta: any }) => (
                  <FormControl fullWidth error={meta.touched && !!meta.error}>
                    <InputLabel id="point-id-label">{t('OriginForm.Point_Label')}</InputLabel>
                    <Select
                      labelId="point-id-label"
                      label={t('OriginForm.Point_Label')}
                      {...field}
                      disabled={lockPointId}
                    >
                      <MenuItem value=""><em>{t('OriginForm.Select_a_Point')}</em></MenuItem>
                      {points.map((point) => (
                        <MenuItem key={point.value} value={point.value}>
                          {point.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {meta.touched && meta.error && (
                      <Typography color="error" variant="caption" component="div">{meta.error}</Typography>
                    )}
                  </FormControl>
                )}
              </Field>

              <Field name="origin">
                {({ field, meta }: { field: any; meta: any }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('OriginForm.Origin_Identifier_Label')}
                    disabled={true}
                    error={meta.touched && !!meta.error}
                    helperText={(meta.touched && meta.error) || t('OriginForm.Origin_Helper_Text')}
                    title={t('OriginForm.Origin_Title_Note')}
                  />
                )}
              </Field>

              <Field name="origin_type_id">
                {({ field, meta }: { field: any; meta: any }) => (
                  <FormControl fullWidth error={meta.touched && !!meta.error}>
                    <InputLabel id="origin-type-id-label">{t('OriginForm.Origin_Type_Label')}</InputLabel>
                    <Select labelId="origin-type-id-label" label={t('OriginForm.Origin_Type_Label')} {...field}>
                      <MenuItem value=""><em>{t('OriginForm.Select_an_Origin_Type')}</em></MenuItem>
                      {originTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {meta.touched && meta.error && (
                      <Typography color="error" variant="caption" component="div">{meta.error}</Typography>
                    )}
                  </FormControl>
                )}
              </Field>

              <Field name="credentials">
                {({ field: fieldPropsForTextField, meta }: FieldProps<string | undefined, OriginFormValues>) => (
                  <div>
                    <TextField
                      {...fieldPropsForTextField}
                      fullWidth
                      label={t('OriginForm.Credentials_Label')}
                      multiline
                      rows={3}
                      error={meta.touched && !!meta.error}
                      helperText={(meta.touched && meta.error) || t('OriginForm.Credentials_Helper_Text')}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setIsCredentialsModalOpen(true)}
                        startIcon={<EditIcon />}
                      >
                        {t('OriginForm.Edit_JSON_Button')}
                      </Button>
                    </Box>
                  </div>
                )}
              </Field>

              <Field name="is_enabled" type="checkbox">
                {({ field }: { field: any }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label={t('OriginForm.Enabled_Label')}
                  />
                )}
              </Field>
            </Stack>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={onCancel} sx={{ mr: 1 }} disabled={formikProps.isSubmitting}>
                {t('OriginForm.Cancel')}
              </Button>
              <Button type="submit" variant="contained" disabled={formikProps.isSubmitting || !formikProps.isValid}>
                {formikProps.isSubmitting ? t('OriginForm.Saving') : t('OriginForm.Save_Origin')}
              </Button>
            </Box>

            {isCredentialsModalOpen && (
              <Modal
                open={isCredentialsModalOpen}
                onClose={() => setIsCredentialsModalOpen(false)}
                aria-labelledby="credentials-json-editor-title"
              >
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: { xs: '90%', sm: 600 },
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: { xs: 2, sm: 4 },
                  borderRadius: 1,
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
                >
                  {(() => {
                    let jsonFormInitialData: Record<string, any>;
                    const isSingleJsonStringFieldTemplate =
                      currentCredentialsTemplate.fields.length === 1 &&
                      currentCredentialsTemplate.fields[0].type === 'json';

                    if (isSingleJsonStringFieldTemplate) {
                      const fieldName = currentCredentialsTemplate.fields[0].name;
                      jsonFormInitialData = { [fieldName]: values.credentials || '{}' };
                    } else {
                      try {
                        jsonFormInitialData = JSON.parse(values.credentials || '{}');
                        if (typeof jsonFormInitialData !== 'object' || jsonFormInitialData === null) {
                          jsonFormInitialData = {};
                        }
                      } catch (e) {
                        console.warn("[OriginForm] Credentials string is not valid JSON. Initializing JsonForm with empty data.", e);
                        jsonFormInitialData = {};
                      }
                    }

                    return (
                      <JsonForm
                        template={currentCredentialsTemplate}
                        initialData={jsonFormInitialData}
                        onSubmit={(data) => {
                          let finalCredentialsString: string;

                          const wasSingleJsonStringFieldTemplate =
                            currentCredentialsTemplate.fields.length === 1 &&
                            currentCredentialsTemplate.fields[0].type === 'json' &&
                            data.hasOwnProperty(currentCredentialsTemplate.fields[0].name) &&
                            typeof data[currentCredentialsTemplate.fields[0].name] === 'string';

                          if (wasSingleJsonStringFieldTemplate) {
                            finalCredentialsString = data[currentCredentialsTemplate.fields[0].name] as string;
                          } else {
                            finalCredentialsString = JSON.stringify(data);
                          }

                          if (finalCredentialsString.trim() === '') {
                            finalCredentialsString = '{}';
                          }

                          try {
                            JSON.parse(finalCredentialsString);
                          } catch (e) {
                            console.warn("[OriginForm] Produced invalid JSON for credentials after JsonForm submission. Defaulting to '{}'. String was:", finalCredentialsString);
                            finalCredentialsString = '{}';
                          }

                          setFieldValue('credentials', finalCredentialsString);
                          setIsCredentialsModalOpen(false);
                        }}
                        onCancel={() => setIsCredentialsModalOpen(false)}
                        title={t('OriginForm.Edit_Credentials_JSON_Title')}
                        submitButtonText={t('OriginForm.Apply_JSON_Button')}
                        cancelButtonText={t('OriginForm.Cancel')}
                      />
                    );
                  })()}
                </Box>
              </Modal>
            )}
          </Form>
        );
      }}
    </Formik>
  );
};

export default OriginForm;