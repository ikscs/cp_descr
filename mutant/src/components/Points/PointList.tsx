// src/components/Points/PointList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next'; // Імпортуємо useTranslation
import PointForm, { PointFormDefaults, type PointFormValues } from './PointForm';
import {
  Box,
  Button,
  Modal,
  Alert,
  CircularProgress,
  Typography,
  Stack,
  Tooltip,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams, type GridRowIdGetter } from '@mui/x-data-grid';
import { Point, pointApi } from '../../api/data/pointApi';
import { useCustomer } from '../../context/CustomerContext';
import { getCustomer } from '../../api/data/customerTools';
import PointAdvancedForm from './PointAdvancedForm';

const PointList: React.FC = () => {
  const { t } = useTranslation(); // Ініціалізуємо хук перекладу
  const { customerData, isLoading: isCustomerLoading } = useCustomer();
  const [points, setPoints] = useState<Point[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<PointFormValues | null>(null);
  const [selectedAdvancedPoint, setSelectedAdvancedPoint] = useState<Point | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // todo: перенести в customerContext
  const [pointFormDefauls, setPointFormDefauls] = useState<PointFormDefaults>({
    country: '',
    city: '',
  });

  const customerAsNumber = Number(customerData?.customer) || -1;

  const getCustomerDefaults = useCallback(async (customerAsNumber: number) => {
    try {
      const customerData = await getCustomer(customerAsNumber);
      if (!customerData.length) {
        setError(new Error(t('Points.PointList.error_fetching_customer_data')));
        console.error('[PointList] customerDefaults.length', customerData.length);
      } else {
        console.log('[PointList] customerData:', customerData);
        setPointFormDefauls((prev) => ({
          ...prev,
          country: customerData[0].country || '',
          city: customerData[0].city || '',
        }));
      }
    } catch (err) {
      setError(new Error(err as string));
      console.error('[PointList] Error fetching customer defaults:', err);
    };
  }, [t]); // Додаємо t до залежностей useCallback

  const getPoints = useCallback(async () => {
    if (!customerData?.customer) {
      setPoints([]);
      return;
    }
    setIsLoading(true);
    try {
      const apiPoints = await pointApi.getPoints( /*customerAsNumber*/ );

      const mappedPoints: Point[] = apiPoints.map((apiPoint: Point) => ({
        customer_id: customerAsNumber,
        point_id: apiPoint.point_id,
        name: apiPoint.name,
        country: apiPoint.country,
        city: apiPoint.city,
        tag: apiPoint.tag,
        start_time: apiPoint.start_time,
        end_time: apiPoint.end_time,
      }));

      setPoints(mappedPoints);
      setError(null);
    } catch (err) {
      console.error('Error fetching points:', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error(t('Points.PointList.error_unexpected_loading_points')));
      }
    } finally {
      setIsLoading(false);
    }
  }, [customerData, t]); // Додаємо t до залежностей useCallback

  useEffect(() => {
    if (customerData?.customer) {
      getPoints();
    }
  }, [getPoints, customerData?.customer]);

  useEffect(() => {
    console.log('[PointList] customerData:', customerData);
    getCustomerDefaults(customerAsNumber);
  }, [getCustomerDefaults, customerData]);

  const handleOpenModal = async (point: Point | null) => {
    if (point) {
      const pointFormValues: PointFormValues = {
        point_id: point.point_id,
        name: point.name,
        country: point.country,
        city: point.city,
        tag: point.tag,
        start_time: point.start_time,
        end_time: point.end_time,
      };
      setSelectedPoint(pointFormValues);
    } else {
      setSelectedPoint(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPoint(null);
  };

  const handleSavePoint = async (values: PointFormValues) => {
    setIsLoading(true);
    try {
      if (selectedPoint && selectedPoint.point_id) {
        await pointApi.updatePoint(selectedPoint.point_id, values);
      } else {
        await pointApi.createPoint({ ...values, customer_id: customerAsNumber });
      }
      await getPoints();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving point:', err);
      setError(new Error(selectedPoint ? t('Points.PointList.error_updating_point') : t('Points.PointList.error_creating_point')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePoint = async (pointId: number) => {
    if (!window.confirm(t('Points.PointList.confirm_delete'))) {
      return;
    }
    setIsLoading(true);
    try {
      await pointApi.deletePoint(pointId);
      console.log('Point deleted:', pointId);
      setPoints((prevPoints) => prevPoints.filter((p) => p.point_id !== pointId));
      setError(null);
    } catch (err) {
      console.error('Error deleting point:', err);
      setError(new Error(t('Points.PointList.error_deleting_point')));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdvancedModal = (point: Point) => {
    setSelectedAdvancedPoint(point);
    setIsAdvancedModalOpen(true);
  };

  const handleCloseAdvancedModal = () => {
    setIsAdvancedModalOpen(false);
    setSelectedAdvancedPoint(null);
  };

  const columns: GridColDef[] = [
    { field: 'point_id', headerName: t('Points.PointList.columns.id'), width: 100 },
    { field: 'name', headerName: t('Points.PointList.columns.name'), width: 200, flex: 1 },
    {
      field: 'actions',
      headerName: t('Points.PointList.columns.actions'),
      width: 320,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Point>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Stack direction="row" spacing={1}>
            <Tooltip title={t('Points.PointList.tooltip_cameras_recorders')}>
              <Button
                onClick={() => handleOpenAdvancedModal(params.row)}
                size="small"
                color="info"
                variant='outlined'
              >
                {t('Points.PointList.sources_button')}
              </Button>
            </Tooltip>
            <Button
              onClick={() => handleOpenModal(params.row)}
              size="small"
              sx={{ mr: 1 }}
              variant='outlined'
            >
              {t('Points.PointList.edit_button')}
            </Button>
            <Button
              onClick={() => handleDeletePoint(params.row.point_id)}
              size="small"
              color="error"
              variant='outlined'
            >
              {t('Points.PointList.delete_button')}
            </Button>
          </Stack>
        </Box>
      ),
    },
  ];

  const getRowId: GridRowIdGetter<Point> = (row) => row.point_id;

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {t('Points.PointList.title')}
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-begin' }}>
        <Button variant="contained" onClick={() => handleOpenModal(null)}>
          {t('Points.PointList.add_button')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error.message}
        </Alert>
      )}

      {(isLoading || isCustomerLoading) && !isModalOpen && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!isCustomerLoading && !customerData?.customer && !error && (
        <Typography sx={{ my: 2 }}>{t('Points.PointList.no_customer_selected')}</Typography>
      )}

      {!isLoading && !isCustomerLoading && customerData?.customer && points.length === 0 && !error && (
        <Typography sx={{ my: 2 }}>{t('Points.PointList.no_data_to_display')}</Typography>
      )}

      {!isLoading && points.length > 0 && (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={points}
            columns={columns}
            getRowId={getRowId}
            pageSizeOptions={[5, 10, 25]}
            autoHeight
            sx={{ maxWidth: '600px' }}
            loading={isLoading}
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
            width: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
          }}
        >
          <PointForm
            key={selectedPoint ? `edit-${selectedPoint.point_id}` : 'create'}
            point={selectedPoint === null ? undefined : selectedPoint}
            defaults={pointFormDefauls}
            _title={
              selectedPoint === null
                ? t('Points.PointList.modal_add_title')
                : t('Points.PointList.modal_edit_title')
            }
            onSave={handleSavePoint}
            onCancel={handleCloseModal}
          />
        </Box>
      </Modal>

      <Modal open={isAdvancedModalOpen} onClose={handleCloseAdvancedModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '1200px',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {selectedAdvancedPoint && (
            <PointAdvancedForm
              point={selectedAdvancedPoint}
              onClose={handleCloseAdvancedModal}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default PointList;