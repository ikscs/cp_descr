// src/components/Points/PointList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import PointForm, { PointFormDefaults, type PointFormValues } from './PointForm'; // Предполагаем, что PointForm в той же папке
import {
  Box,
  Button,
  Modal,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams, type GridRowIdGetter } from '@mui/x-data-grid'; // Import GridRowIdGetter
import { Point, pointApi } from '../../api/data/pointApi';
import { useCustomer } from '../../context/CustomerContext'; // Import useCustomer
import { getCustomer } from '../../api/data/customerTools';

const PointList: React.FC = () => {
  const { customerData, isLoading: isCustomerLoading } = useCustomer(); // Access customer context
  const [points, setPoints] = useState<Point[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<PointFormValues | null>(null);
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
        setError(new Error('Не вдалося отримати дані клієнта.'));
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
  }, []);

  const getPoints = useCallback(async () => {
    if (!customerData?.customer) {
      setPoints([]);
      return;
    }
    setIsLoading(true);
    try {
      const apiPoints = await pointApi.getPoints(customerAsNumber);

      // Transform the API data to match the Point interface expected by the UI and DataGrid
      const mappedPoints: Point[] = apiPoints.map((apiPoint: Point) => ({
        customer_id: customerAsNumber,
        point_id: apiPoint.point_id,
        name: apiPoint.name,
        country: apiPoint.country,
        city: apiPoint.city,
      }));

      setPoints(mappedPoints);
      setError(null);
    } catch (err) {
      console.error('Error fetching points:', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Сталася непередбачена помилка під час завантаження точок.'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [customerData]); // Add customerData to dependencies

  useEffect(() => {
    if (customerData?.customer) { // Fetch points only if a customer is selected
      getPoints();
    }
  }, [getPoints, customerData?.customer]); // Re-fetch if getPoints or customer ID changes

  useEffect(() => {
    console.log('[PointList] customerData:', customerData);
    getCustomerDefaults(customerAsNumber);
  }, [getCustomerDefaults, customerData]);

  const handleOpenModal = async (point: Point | null) => {
    if (point) {
      // Преобразуем Point к PointFormValues, если они отличаются
      const pointFormValues: PointFormValues = {
        point_id: point.point_id,
        name: point.name,
        country: point.country,
        city: point.city
      };
      setSelectedPoint(pointFormValues);
    } else {
      setSelectedPoint(null);
      // // Для создания новой точки получить из таблицы customer значения полей country, city
      // const customerDefaults = await getCustomerDefaults(customerAsNumber);
      // setSelectedPoint({
      //   name: '', 
      //   country: customerDefaults?.country || '', // Use default or empty string if not found
      //   city: customerDefaults?.city || '' // Use default or empty string if not found
      // }); 
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
        await pointApi.createPoint({...values, customer_id: customerAsNumber});
      }
      await getPoints(); // Обновить список точек
      handleCloseModal();
    } catch (err) {
      console.error('Error saving point:', err);
      setError(new Error(selectedPoint ? 'Помилка під час оновлення точки.' : 'Помилка під час створення точки.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePoint = async (pointId: number) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю точку?')) {
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
      setError(new Error('Помилка під час видалення точки.'));
    } finally {
      setIsLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'point_id', headerName: 'ID', width: 100 }, // Изменено с 'id' на 'point_id' для отображения
    { field: 'name', headerName: 'Назва', width: 200, flex: 1 },
    // { field: 'description', headerName: 'Опис', width: 300, flex: 2 },
    {
      field: 'actions',
      headerName: 'Дії',
      width: 300,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Point>) => (
        <>
          <Button
            onClick={() => handleOpenModal(params.row)}
            size="small"
            sx={{ mr: 1 }}
          >
            Редагувати
          </Button>
          <Button
            onClick={() => handleDeletePoint(params.row.point_id)}
            size="small"
            color="error"
          >
            Видалити
          </Button>
        </>
      ),
    },
  ];

  // Функция для получения ID строки
  const getRowId: GridRowIdGetter<Point> = (row) => row.point_id;

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Пункти обліку
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-begin' }}>
        <Button variant="contained" onClick={() => handleOpenModal(null)}>
          Додати
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error.message}
        </Alert>
      )}

      {(isLoading || isCustomerLoading) && !isModalOpen && ( // Show loader if points are loading OR customer data is loading
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!isCustomerLoading && !customerData?.customer && !error && ( // Message if no customer is selected
        <Typography sx={{my: 2}}>Будь ласка, оберіть клієнта для відображення точок.</Typography>
      )}

      {!isLoading && !isCustomerLoading && customerData?.customer && points.length === 0 && !error && (
         <Typography sx={{my: 2}}>Немає даних для відображення.</Typography>
      )}

      {!isLoading && points.length > 0 && (
        <Box sx={{ height: 400, width: '100%' }}> {/* Задайте высоту для DataGrid */}
          <DataGrid
            rows={points}
            columns={columns}
            getRowId={getRowId} // Указываем DataGrid использовать point_id как ID строки
            pageSizeOptions={[5, 10, 25]}
            autoHeight //={false} // Установите false, если задаете высоту контейнера
            sx={{ maxWidth: '50%' }}

            // initialState={{ // Пример пагинации
            //   pagination: {
            //     paginationModel: { pageSize: 5 },
            //   },
            // }}
            loading={isLoading} // DataGrid имеет свой пропс loading
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
            width: 600, // Фиксированная ширина как в UserList
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4, // Фиксированные отступы как в UserList
            borderRadius: 1, // Оставим небольшое скругление углов, если оно не мешает
          }}
        >
          <PointForm
            // Ключ для реинициализации формы при смене selectedPoint
            key={selectedPoint ? `edit-${selectedPoint.point_id}` : 'create'}
            point={selectedPoint === null ? undefined : selectedPoint}
            defaults={pointFormDefauls}
            title={
              selectedPoint === null
                ? 'Додати новий пункт обліку'
                : 'Редагувати пункт обліку'
            }
            onSave={handleSavePoint}
            onCancel={handleCloseModal}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default PointList;
