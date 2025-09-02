// src/components/origins/OriginsList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Modal,
  Alert,
  CircularProgress,
  Typography,
  Stack,
  Checkbox,
  // FormControlLabel,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams, type GridRowIdGetter } from '@mui/x-data-grid';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { originApi, type Origin, type CreateOriginData, type UpdateOriginData } from '../../api/data/originApi'; // Adjust import path as necessary
// Assuming OriginsForm is in the same directory and can be imported.
import { useCustomer } from '../../context/CustomerContext'; // Import useCustomer
// If OriginsForm is still .jsx, you might need to adjust imports or use // @ts-ignore
import OriginForm from './OriginForm'; // Ensure path is correct

// Values for the form, might differ slightly from the API's Origin type
// e.g., IDs from dropdowns might be strings initially, credentials as JSON string
export interface OriginFormSubmitValues {
  id?: number;
  point_id: string | number; // Comes from form, needs to be number for API
  name: string;
  origin: string; // Textual identifier (form has it, API handling varies)
  origin_type_id: string | number; // Comes from form, needs to be number for API
  credentials?: string; // JSON string from form
  is_enabled: boolean;
  poling_period_s?: number;
}

// Props for OriginsList
interface OriginsListProps {
  pointIdFilter?: number; // To filter origins by point_id
  // onOriginSelect?: (originId: number) => void; // Optional: if needed for other components
}

const OriginList: React.FC<OriginsListProps> = ({ pointIdFilter }) => {
  const { t } = useTranslation();
  const { customerData, isLoading: isCustomerLoading } = useCustomer(); // Access customer context
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<Origin | null>(null); // Use API Origin type for editing
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const fetchOrigins = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let data: Origin[] = [];
      if (pointIdFilter === -1) {
        // Fetch origins for the customer
        if (customerData?.customer) {
          const customerId = Number(customerData.customer);
          // Assuming originApi.getCustomerOrigins exists and takes customerId
          // You'll need to ensure this method is implemented in your originApi
          data = await originApi.getCustomerOrigins(/*customerId*/);
        } else {
          // No customer selected, or customerData is not loaded yet for customer-wide view
          setOrigins([]);
          setIsLoading(false); // Stop loading as we can't proceed
          return;
        }
      } else if (typeof pointIdFilter === 'number') { // Specific point ID (and not -1)
        // Fetch origins for a specific point
        data = await originApi.getOrigins(pointIdFilter);
      } else {
        // pointIdFilter is undefined or null, clear origins
        setOrigins([]);
        setIsLoading(false); // Stop loading as there's nothing to fetch
        return;
      }
      setOrigins(data);
    } catch (err) {
      console.error('[OriginsList] Error fetching origins:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch origins.';
      setError(new Error(errorMessage));
      setOrigins([]); // Clear origins on error
    } finally {
      setIsLoading(false);
    }
  }, [pointIdFilter, customerData]); // Added customerData

  useEffect(() => {
    if (pointIdFilter === -1) {
      if (customerData?.customer && !isCustomerLoading) { // If customer view, customer is selected and not loading
        fetchOrigins();
      } else {
        setOrigins([]); // Clear origins if customer view but no customer or customer is loading
      }
    } else if (pointIdFilter !== undefined && pointIdFilter !== null) { // If specific point view
      fetchOrigins();
    } else { // pointIdFilter is undefined or null (and not -1)
      setOrigins([]); // Clear origins if no point selected
    }
  }, [fetchOrigins, pointIdFilter, customerData?.customer, isCustomerLoading]);

  useEffect(() => {
  // Если pointIdFilter задан и не -1, то при открытии модалки для создания (selectedOrigin === null)
  // передаем originDefault с point_id
  if (isModalOpen && !selectedOrigin && pointIdFilter !== undefined && pointIdFilter !== -1) {
    setSelectedOrigin({
      id: undefined,
      point_id: pointIdFilter,
      name: '',
      origin: uuidv4(), // Генерируем уникальный идентификатор для origin 
      origin_type_id: '',
      credentials: '{}',
      is_enabled: true,
      poling_period_s: undefined,
    } as any); // Приведение к Origin, если нужно
  }
  // Если pointIdFilter == -1, то сбрасываем selectedOrigin для создания
  if (isModalOpen && !selectedOrigin && pointIdFilter === -1) {
    setSelectedOrigin(null);
  }
}, [isModalOpen, pointIdFilter, selectedOrigin, setSelectedOrigin]);

  const handleOpenModal = (origin: Origin | null) => {
    setSelectedOrigin(origin);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrigin(null);
  };

  const handleSaveOrigin = async (formValues: OriginFormSubmitValues) => {
    // pointIdFilter is used for context (which list to refresh),
    // but for creating, the form's point_id is primary.
    // For editing, selectedOrigin.point_id is used (or formValues.point_id if allowed to change).
    // A general check for formValues.point_id is more relevant here.

    setIsLoading(true);
    setError(null);

    let parsedCredentials: object | null = null;
    if (formValues.credentials && formValues.credentials.trim() !== '') {
      try {
        parsedCredentials = JSON.parse(formValues.credentials);
      } catch (jsonError) {
        console.error("[OriginsList] Invalid JSON in credentials:", jsonError);
        setError(new Error("Credentials field contains invalid JSON."));
        setIsLoading(false);
        return;
      }
    }

    try {
      if (selectedOrigin && selectedOrigin.id) { // Editing existing origin
        const updateData: UpdateOriginData = {
          name: formValues.name,
          // point_id can be updated if your API/DB schema allows changing the point an origin belongs to
          point_id: Number(formValues.point_id),
          origin: formValues.origin,
          origin_type_id: Number(formValues.origin_type_id),
          is_enabled: formValues.is_enabled,
          credentials: parsedCredentials,
          poling_period_s: formValues.poling_period_s,
          // The 'origin' textual identifier field is not part of UpdateOriginData in originApi
        };
        await originApi.updateOrigin(selectedOrigin.id, updateData);
      } else { // Creating new origin
        const createData: CreateOriginData = {
          name: formValues.name,
          // point_id MUST come from the form when creating.
          // The form's point_id dropdown is populated by OriginsForm itself.
          point_id: Number(formValues.point_id),
          origin: formValues.origin,
          origin_type_id: Number(formValues.origin_type_id),
          is_enabled: formValues.is_enabled,
          credentials: parsedCredentials,
          poling_period_s: formValues.poling_period_s,
          // The 'origin' textual identifier field is not part of CreateOriginData in originApi (backend generated)
        };
        // Form validation should catch if point_id is not selected. This is an extra safeguard.
        if (isNaN(createData.point_id) || createData.point_id <= 0) {
          setError(new Error("A valid Point must be selected from the dropdown."));
          setIsLoading(false); // Stop loading
          return; // Prevent API call
        }
        await originApi.createOrigin(createData);
      }
      await fetchOrigins(); // Refresh list
      handleCloseModal();
    } catch (err) {
      console.error('[OriginsList] Error saving origin:', err);
      const errorMessage = err instanceof Error ? err.message : (selectedOrigin ? 'Error updating origin.' : 'Error creating origin.');
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrigin = async (originId: number) => {
    // if (!window.confirm('Are you sure you want to delete this origin?')) {
    if (!window.confirm(t('OriginList.Are_you_sure'))) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await originApi.deleteOrigin(originId);
      setOrigins((prevOrigins) => prevOrigins.filter((o) => o.id !== originId));
    } catch (err) {
      console.error('[OriginsList] Error deleting origin:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error deleting origin.';
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const columns: GridColDef<Origin>[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: t('OriginList.Name'), width: 200, flex: 1 },
    { field: 'origin', headerName: t('OriginList.OriginIdentifier'), width: 250, flex: 1.5 },
    {
      field: 'origin_type_id',
      headerName: t('OriginList.Type'),
      width: 100,
      // To show type name, you'd need to fetch origin_types and map here
    },
    {
      field: 'is_enabled',
      headerName: t('OriginList.Enabled'),
      width: 120,
      renderCell: (params: GridRenderCellParams<Origin>) => (
        <Checkbox checked={params.value} disabled />
      ),
    },
    {
      field: 'actions',
      headerName: t('OriginList.Actions'),
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Origin>) => (
        <Stack direction="row" spacing={1} sx={{mt: 1}} >
          <Button
            onClick={() => handleOpenModal(params.row)}
            size="small"
            variant="outlined"
          >
            {/* Edit */}
            {t('OriginList.Edit')}
          </Button>
          <Button
            onClick={() => handleDeleteOrigin(params.row.id)}
            size="small"
            variant="outlined"
            color="error"
          >
            {/* Delete */}
            {t('OriginList.Delete')}
          </Button>
        </Stack>
      ),
    },
  ];

  const getRowId: GridRowIdGetter<Origin> = (row) => row.id;

  // Prepare initial values for the form when editing
  // OriginsForm expects `originToEdit` with string credentials
  const originToEditForForm = selectedOrigin
    ? {
      ...selectedOrigin,
      point_id: selectedOrigin.point_id.toString(), // Form might expect string
      origin_type_id: selectedOrigin.origin_type_id.toString(), // Form might expect string
      credentials: selectedOrigin.credentials
        ? JSON.stringify(selectedOrigin.credentials, null, 2)
        : '{}',
    }
    : undefined;


  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        {pointIdFilter === -1 && (
        <Typography variant="h5">
          Origins
          {pointIdFilter !== undefined && pointIdFilter !== -1 && ` for Point ${pointIdFilter}`}
          {pointIdFilter === -1 && customerData?.customer && !isCustomerLoading && ` for Customer ${customerData.customer}`}
          {pointIdFilter === -1 && !customerData?.customer && !isCustomerLoading && ` (All Origins - Please Select Customer)`}
          {pointIdFilter === -1 && isCustomerLoading && ` (Loading Customer Origins...)`}
        </Typography>
        )}
        <Button
          variant="contained"
          onClick={() => handleOpenModal(null)}
          // Disable if no point context OR if in customer mode and no customer selected/loading
          disabled={pointIdFilter === undefined || (pointIdFilter === -1 && (!customerData?.customer || isCustomerLoading))}
        >
          {/* Add Origin */}
          {t('OriginList.AddOrigin')}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error.message}
        </Alert>
      )}

      {(isLoading || (pointIdFilter === -1 && isCustomerLoading)) && !isModalOpen && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Message if no point is selected (and not in customer-wide mode) */}
      {pointIdFilter === undefined && !isLoading && !(pointIdFilter === -1 && isCustomerLoading) && !error && (
        <Typography sx={{ my: 2 }}>Please select a point to manage its origins.</Typography>
      )}

      {/* Message if in customer-wide mode but no customer is selected (and customer not loading) */}
      {pointIdFilter === -1 && !customerData?.customer && !isCustomerLoading && !isLoading && !error && (
        <Typography sx={{ my: 2 }}>Please select a customer to view their origins.</Typography>
      )}

      {/* Message if a specific point is selected, not loading, no origins, and no error */}
      {pointIdFilter !== undefined && pointIdFilter !== -1 && !isLoading && origins.length === 0 && !error && (
        <Typography sx={{ my: 2 }}>No origins found for this point.</Typography>
      )}

      {/* Message if customer-wide view, customer selected, not loading, no origins, and no error */}
      {pointIdFilter === -1 && customerData?.customer && !isCustomerLoading && !isLoading && origins.length === 0 && !error && (
        <Typography sx={{ my: 2 }}>No origins found for this customer.</Typography>
      )}

      {!(isLoading || (pointIdFilter === -1 && isCustomerLoading)) && origins.length > 0 && !error && (
        <Box sx={{ height: '100%', width: '100%' }}>
          <DataGrid
            rows={origins}
            columns={columns}
            getRowId={getRowId}
            pageSizeOptions={[5, 10, 25]}
            autoHeight={false} // Set to false if container has fixed height
            loading={isLoading || (pointIdFilter === -1 && isCustomerLoading)} // DataGrid's own loading prop
          // initialState={{ pagination: { paginationModel: { pageSize: 5 }}}}
          />
        </Box>
      )}

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 600 }, // Responsive width
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: { xs: 2, sm: 4 }, // Responsive padding
            borderRadius: 1,
            maxHeight: '90vh', // Prevent modal from being too tall
            overflowY: 'auto',  // Allow scrolling within modal if content overflows
          }}
        >
          <OriginForm
            key={selectedOrigin ? `edit-${selectedOrigin.id}` : `create-${pointIdFilter || 'new'}`}
            originToEdit={originToEditForForm}
            onSave={handleSaveOrigin}
            onCancel={handleCloseModal}
            lockPointId={pointIdFilter !== undefined && pointIdFilter !== -1}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default OriginList;
