import React, { useState, useEffect } from 'react';
import UserForm from './UserForm';
import { fetchUsers, type User } from '../../api/fetchUsers';
import { updateUser } from '../../api/updateUser';
import { createUser } from '../../api/createUser';
import { deleteUser } from '../../api/deleteUser';
import { tenantId, apiKey } from '../../globals_VITE';
import { updateUserRoles } from '../../api/updateUserRoles';
import {
  Box,
  Button,
  Modal,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useCustomer } from '../../context/CustomerContext'; 

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [/*childTenantId,*/ _setChildTenantId] = useState<string>('6nzyjqyb'); // Replace with your child tenant ID
  const { customerData, } = useCustomer(); 

  const getUsers = async () => {
    setIsLoading(true);
    try {

      // const fetchedUsers = await fetchUsers(tenantId, apiKey);
      const fetchedUsers1: any[] = await fetchUsers(tenantId, apiKey);
      const fetchedUsers: User[] = fetchedUsers1.filter(user => user.data.customer == customerData?.customer);
      
      console.log('fetchedUsers', fetchedUsers);
      setUsers([...fetchedUsers]);
      setError(null);
    } catch (err) {
      console.log(err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Сталася непередбачена помилка.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleOpenModal = (user: User | null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdate = async (updatedUser: User) => {
    try {
      await updateUser(tenantId, apiKey, updatedUser.userId, {
        username: updatedUser.username,
        email: updatedUser.email,
      });

      const roles = updatedUser.authorization[tenantId].roles;
      if (roles) {
        await updateUserRoles(tenantId, apiKey, updatedUser.userId, { roles });
        // await updateUserRoles(childTenantId, apiKey, updatedUser.userId, { roles });
      }
      await getUsers();
      handleCloseModal();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(new Error('Не вдалося оновити користувача.'));
    }
  };

  const handleUserCreate = async (newUser: User) => {
    try {
      const createdUser = await createUser(tenantId, apiKey, newUser);

      const roles = newUser.authorization[tenantId].roles;
      if (roles) {
        await updateUserRoles(tenantId, apiKey, createdUser.userId, { roles });
      }
      await getUsers();
      handleCloseModal();
    } catch (err) {
      console.error('Error creating user:', err);
      setError(new Error('Не вдалося створити користувача.'));
    }
  };

  const handleSave = async (values: User) => {
    if (selectedUser) {
      await handleUserUpdate(values);
    } else {
      await handleUserCreate(values);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      return;
    }
    try {
      await deleteUser(tenantId, apiKey, userId);
      setUsers(users.filter((user) => user.userId !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(new Error('Не вдалося видалити користувача.'));
    }
  };

  const columns: GridColDef[] = [
    { field: 'userId', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'roles', headerName: 'Ролі', width: 250 },
    {
      field: 'actions',
      headerName: 'Дії',
      width: 250,
      renderCell: (params) => (
        <>
          <Button onClick={() => handleOpenModal(params.row)} size="small">
            Редагувати
          </Button>
          <Button onClick={() => handleDeleteUser(params.row.userId)} size="small">
            Видалити
          </Button>
        </>
      ),
    },
  ];

  const userRoles = (user: User) => {
    return user.authorization[tenantId]?.roles.join(', ') ?? '';
  };

  const usersExt = users.map((user) => {
    return {
      ...user,
      id: user.userId, // DataGrid requires an 'id' field
      roles: userRoles(user),
    };
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => handleOpenModal(null)}>
          Додати користувача
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={usersExt}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          autoHeight
          sx={{ maxWidth: '80%' }}
        />
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
          }}
        >
          <UserForm
            user={selectedUser === null ? undefined : selectedUser}
            title={selectedUser === null ? 'Додати користувача' : 'Редагувати користувача'}
            onSave={handleSave}
            onCancel={handleCloseModal}
            tenantId={tenantId}
            // tenantId={childTenantId}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default UserList;
