import React, { useState, useEffect, useCallback } from 'react';
import { Group } from './group.types';
import api from '../../api/data/groupApiAxios';
import { useCustomer } from '../../context/CustomerContext';
import GroupForm from './GroupForm';
import { Alert, Box, Button, Modal, Stack, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowIdGetter } from '@mui/x-data-grid';
// import { getData } from '../../api/data/dataTools';
import { getPoints } from '../../api/data/customerTools';
// import { fr } from 'date-fns/locale';
// import { Point } from '../../api/data/pointApi';
import { useTranslation } from 'react-i18next'; // Импортируем хук

interface LookupData {
  point_id: number;
  name: string;
}

/**
 * Пропсы для компонента GroupList.
 * Пока не содержит специфических пропсов, но можно будет добавить позже.
 */
interface GroupListProps {
  // Например: onGroupSelect?: (group: Group) => void;
}

const GroupList: React.FC<GroupListProps> = (_props) => {
  const { t } = useTranslation('groupList');
  const { customerData, } = useCustomer();
  const [groups, setGroups] = useState<Group[]>([]);
  const [points, setPoints] = useState<LookupData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // const groups: Group[] = await api.get('/groups', {customer_id: customerData?.customer});
      // const groups: Group[] = await api.get(customerData?.customer || 0);
      const groups: Group[] = await api.get();
      setGroups(groups);
    } catch (err) {
      setError(new Error('Не удалось загрузить список групп.'));
      console.error(err);
    } finally {
      setLoading(false);
    }

    try {
      const pointsList = await getPoints(Number(customerData?.customer));
      setPoints(pointsList.map((point: any) => ({
        point_id: point.point_id,
        name: point.name,
      })));
    } catch (error) {
      console.error("Error fetching points:", error);
      setError(new Error("Failed to load points."));
    }
  }, [customerData?.customer]);

  useEffect(() => {
    if (customerData?.customer) { // Загружаем группы только если customer_id доступен
      fetchGroups();
    } else {
      // Можно установить группы в пустой массив или показать сообщение, если customer_id отсутствует
      setGroups([]);
      setLoading(false);
    }
  }, [fetchGroups, customerData?.customer]);

  const handleSaveGroup = async (updatedGroup: Group) => {
    setIsSubmitting(true);
    setError(null);
    try {
      console.log('Сохранение группы:', updatedGroup);
      const isNewGroup = groups.find(g => g.group_id === updatedGroup.group_id) === undefined;

      if (isNewGroup) {
        // updatedGroup = await api.post('/groups', updatedGroup);
        updatedGroup = await api.post(updatedGroup);
        setGroups(prevGroups => [...prevGroups, updatedGroup]);
      } else {
        if (!updatedGroup.group_id) {
          setError(new Error('group_id не может быть пустым.'));
          return;
        }
        // await api.put(`/groups/${updatedGroup.group_id}`, updatedGroup);
        await api.put(updatedGroup.group_id, updatedGroup);
        setGroups(prevGroups =>
          prevGroups.map(g => (g.group_id === updatedGroup.group_id ? updatedGroup : g))
        );
      }
      setEditingGroup(null); // Закрываем форму после сохранения
    } catch (err) {
      setError(new Error('Не удалось изменить/добавить группу.'));
      console.error('Ошибка при сохранении/добавлении группы:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!window.confirm(t('deleteConfirm', { groupId }))) {
    // if (!window.confirm('Are you sure you want to delete group with ID ' + groupId + '?')) {
      return;
    }
    console.log(`Удаление группы с ID: ${groupId}`);
    try {
      await api.delete(groupId);
      setGroups(prevGroups => prevGroups.filter(group => group.group_id !== groupId));
    } catch (err) {
      setError(new Error(t('deleteError')));
      // setError(new Error('Не удалось удалить группу.'));
      console.error('Ошибка при удалении группы:', err);
    }
  };

  if (loading) return <p>{t('loadingMessage')}</p>;
  if (error) return <p style={{ color: 'red' }}>{t('errorMessage', { error_message: error.message })}</p>;
  // if (loading) return <p>Загрузка групп...</p>;
  // if (error) return <p style={{ color: 'red' }}>Ошибка: {error.message}</p>;

  const defaultGroup: Group = {
    // group_id: 0,
    name: '',
    // point_id: -1,
    customer_id: Number(customerData?.customer || 0),
  };

  const handleOpenModal = (group: Group | null) => {
    setEditingGroup(group || defaultGroup);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null); // Сбрасываем редактируемую группу при закрытии
  };


  const getRowId: GridRowIdGetter<Group> = (row) => row.group_id ?? -1;

  const columns: GridColDef<Group>[] = [
    { field: 'group_id', headerName: t('columns.id'), width: 90 },
    { field: 'name', headerName: t('columns.name'), width: 250, flex: 1 },
    { field: 'point_id', headerName: t('columns.pointId'), width: 150 },
    // { field: 'group_id', headerName: 'ID', width: 90 },
    // { field: 'name', headerName: 'Name', width: 250, flex: 1 },
    // { field: 'point_id', headerName: 'Point ID', width: 150, },
    {
      field: 'actions',
      headerName: t('columns.actions'),
      // headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Group>) => (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Stack direction="row" spacing={1} >
          <Button
            onClick={() => handleOpenModal(params.row)}
            size="small"
            variant="outlined"
          >
              {t('actions.edit')}
            {/* Edit */}
          </Button>
          <Button
            onClick={() => handleDeleteGroup(params.row.group_id ?? -1)}
            size="small"
            variant="outlined"
            color="error"
            disabled={isSubmitting}
          >
              {t('actions.delete')}
            {/* Delete */}
          </Button>
        </Stack>
      </Box>
      ),
    },
  ];

  return (
    <div>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">
          {t('title')}
          {/* Groups */}
        </Typography>
      </Stack>

      <Button
        variant="contained"
        onClick={() => handleOpenModal(null)}
        // Disable if no point context OR if in customer mode and no customer selected/loading
        disabled={false}
      >
        {t('addButton')}
        {/* Add */}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {/* {t('errorMessage', { error_message: error.message })} */}
          {error}
        </Alert>
      )}
      <Box sx={{ height: '100%', width: '100%' }}>
        <DataGrid
          sx={{ height: '100%', width: '100%' }}
          rows={groups}
          columns={columns}
          getRowId={getRowId}
          pageSizeOptions={[5, 10, 25]}
          autoHeight={false} // Set to false if container has fixed height
          loading={loading}
        // initialState={{ pagination: { paginationModel: { pageSize: 5 }}}}
        />
      </Box>

      {(editingGroup) && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
          {/* <h3>Редактирование группы: {editingGroup.name}</h3> */}
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
              <GroupForm
                group={editingGroup}
                pointOptions={points}
                onSubmit={handleSaveGroup}
                onCancel={handleCloseModal} // Используем handleCloseModal для отмены
              // isLoading={isSubmitting}
              />
            </Box>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default GroupList;