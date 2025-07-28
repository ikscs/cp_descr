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
import { pointApi } from '../../api/data/pointApi';
import { useCustomer } from '../../context/CustomerContext'; // Import useCustomer
// import { originTypeApi, OriginTypeOption, type OriginTypeOption as ApiOriginTypeOption } from '../../api/data/originTypeApi'; // Import OriginTypeOption
import { originTypeApi, OriginTypeOption, } from '../../api/data/originTypeApi'; // Import OriginTypeOption
import JsonForm, { type JsonFormTemplate } from '../common/JsonForm';
// import type { Point } from '../../api/data/pointApi'; // Not directly used, but good for context if pointApi returns full Point objects

// Interface for form values
export interface OriginFormValues {
  id?: number; // Present when editing
  point_id: string | number; // Dropdown value, needs to be number for API
  name: string;
  origin: string; // Textual identifier for the stream/camera
  origin_type_id: string | number; // Dropdown value, needs to be number for API
  credentials?: string; // JSON string
  is_enabled: boolean;
  poling_period_s?: number; // Optional polling period in seconds
}

// Props for the form component
export interface OriginFormProps {
  originToEdit?: OriginFormValues;
  onSave: (values: OriginFormValues) => void;
  onCancel: () => void;
  title?: string;
  lockPointId?: boolean; // New prop to lock point_id field
}

const OriginForm: React.FC<OriginFormProps> = ({
  originToEdit,
  onSave,
  onCancel,
  title = originToEdit ? 'Edit Origin' : 'Add New Origin',
  lockPointId = false, // Default to false for backward compatibility
}) => {
  const { customerData, isLoading: isCustomerLoading } = useCustomer(); // Access customer context
  const [points, setPoints] = useState<Array<{ value: number | string; label: string }>>([]);
  const [originTypes, setOriginTypes] = useState<OriginTypeOption[]>([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [dropdownError, setDropdownError] = useState<string | null>(null);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);

  const defaultCredentialsEditorTemplate: JsonFormTemplate = {
    fields: [
      {
        name: 'jsonString', // This name is crucial for how JsonForm returns data
        label: 'Credentials JSON',
        type: 'json', // Assuming 'json' type is handled by JsonForm as a textarea for JSON string
        validation: { isJson: true }, // JsonForm might handle this internally for type: 'json'
        muiProps: {
          multiline: true,
          rows: 10,
          placeholder:
            'Enter valid JSON. e.g., {"user":"admin", "pass":"secret"}. Leave empty or use {} for no credentials.',
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
        setDropdownError('Please select a customer to load available points.');
        setIsLoadingDropdowns(false);
        return;
      }

      try {
        const customerId = Number(customerData.customer);
        if (isNaN(customerId) || customerId <= 0) {
          setDropdownError("Invalid customer ID provided.");
          setPoints([]);
          setOriginTypes([]);
          setIsLoadingDropdowns(false);
          return;
        }

        const [pointsData, originTypesData] = await Promise.all([
          pointApi.getPoints(/*customerId*/),
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
        const message = err instanceof Error ? err.message : 'Failed to load data for dropdowns.';
        setDropdownError(message);
        setPoints([]);
        setOriginTypes([]);
      } finally {
        setIsLoadingDropdowns(false);
      }
    };
    loadDropdownData();
  }, [customerData?.customer, isCustomerLoading]);

  const initialValues: OriginFormValues = originToEdit || {
    name: '',
    point_id: '',
    origin: '',
    origin_type_id: '',
    credentials: '{}',
    is_enabled: true,
    poling_period_s: undefined, // Optional polling period
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    point_id: Yup.number().required('Point is required'),
    origin: Yup.string().required('Origin identifier (URL/path) is required'),
    origin_type_id: Yup.number().required('Origin type is required'),
    credentials: Yup.string().test(
      'is-json',
      'Credentials must be a valid JSON string or empty',
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
      .positive('Polling period must be a positive number')
      .integer('Polling period must be an integer'),
  });

  if (isLoadingDropdowns) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading form data...</Typography>
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

        // console.log("[OriginForm] Current credentials template:", currentCredentialsTemplate);

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
                    label="Name"
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                  />
                )}
              </Field>

              <Field name="point_id">
                {({ field, meta }: { field: any; meta: any }) => (
                  <FormControl fullWidth error={meta.touched && !!meta.error}>
                    <InputLabel id="point-id-label">Point</InputLabel>
                    <Select
                      labelId="point-id-label"
                      label="Point"
                      {...field}
                      disabled={lockPointId}
                    >
                      <MenuItem value=""><em>Select a Point</em></MenuItem>
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
                    label="Origin Identifier (URL/Path)"
                    disabled={true}
                    error={meta.touched && !!meta.error}
                    helperText={(meta.touched && meta.error) || "e.g., rtsp://... or /dev/video0"}
                    title="Note: The backend API might auto-generate or not allow updates to this specific identifier after creation."
                  />
                )}
              </Field>

              <Field name="origin_type_id">
                {({ field, meta }: { field: any; meta: any }) => (
                  <FormControl fullWidth error={meta.touched && !!meta.error}>
                    <InputLabel id="origin-type-id-label">Origin Type</InputLabel>
                    <Select labelId="origin-type-id-label" label="Origin Type" {...field}>
                      <MenuItem value=""><em>Select an Origin Type</em></MenuItem>
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

              <Field name="poling_period_s">
                {({ field, meta }: { field: any; meta: any }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Polling Period (seconds)"
                    type="number"
                    error={meta.touched && !!meta.error}
                    helperText={
                      (meta.touched && meta.error) || 'Optional. How often data is polled (e.g., 60 for every minute).'
                    }
                  />
                )}
              </Field>
              
              <Field name="credentials">
                {({ field: fieldPropsForTextField, meta }: FieldProps<string | undefined, OriginFormValues>) => (
                  <div>
                    <TextField
                      {...fieldPropsForTextField}
                      fullWidth
                      label="Credentials (JSON format)"
                      multiline
                      rows={3}
                      error={meta.touched && !!meta.error}
                      helperText={(meta.touched && meta.error) || "Optional. e.g., {\"user\":\"admin\", \"pass\":\"secret\"}"}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setIsCredentialsModalOpen(true)}
                        startIcon={<EditIcon />}
                      >
                        Edit JSON
                      </Button>
                    </Box>
                  </div>
                )}
              </Field>

              <Field name="is_enabled" type="checkbox">
                {({ field }: { field: any }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Enabled"
                  />
                )}
              </Field>
            </Stack>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={onCancel} sx={{ mr: 1 }} disabled={formikProps.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={formikProps.isSubmitting || !formikProps.isValid}>
                {formikProps.isSubmitting ? 'Saving...' : 'Save Origin'}
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
                    // Determine initialData for JsonForm based on the template
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
                            JSON.parse(finalCredentialsString); // Validate
                          } catch (e) {
                            console.warn("[OriginForm] Produced invalid JSON for credentials after JsonForm submission. Defaulting to '{}'. String was:", finalCredentialsString);
                            finalCredentialsString = '{}';
                          }

                          setFieldValue('credentials', finalCredentialsString);
                          setIsCredentialsModalOpen(false);
                        }}
                        onCancel={() => setIsCredentialsModalOpen(false)}
                        title="Edit Credentials JSON"
                        submitButtonText="Apply JSON"
                        cancelButtonText="Cancel"
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
