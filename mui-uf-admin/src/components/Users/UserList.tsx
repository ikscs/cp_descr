import React, { useState, useEffect } from 'react';
import Modal from '../Shared/Modal';
import Table from '../Shared/Table';
import UserForm from './UserForm';
import { fetchUsers, User } from '../../api/fetchUsers';
import { updateUser } from '../../api/updateUser';
import { createUser } from '../../api/createUser';
import { deleteUser } from '../../api/deleteUser';
import { tenantId, apiKey } from '../../globals';
import { updateUserRoles } from '../../api/updateUserRoles';
// import { Column } from '../../types';

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const getUsers = async () => {
      // setLoading(true);
      try {
        const fetchedUsers = await fetchUsers(tenantId, apiKey);
        console.log('fetchedUsers', fetchedUsers);
        setUsers([...fetchedUsers]);
        setError(null);
      } catch (err) {
        console.log(err);
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error('An unexpected error occurred.'));
        }
      } finally {
        // setLoading(false);
      }
    }

  useEffect(() => {
    getUsers();
  }, []);

  // if (loading) {
  //   return <div>Загрузка пользователей...</div>;
  // }

  if (error) {
    return <div>Ошибка: {error.message}</div>;
    // return <div>Ошибка загрузки пользователей: {error.message}</div>;
  }

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
        // Update basic user info
        await updateUser(tenantId, apiKey, updatedUser.userId, {
            username: updatedUser.username,
            email: updatedUser.email,
        });

        const roles = updatedUser.authorization[tenantId].roles;
        if (roles) {
            await updateUserRoles(tenantId, apiKey, updatedUser.userId, { roles });
        }

        // Update local state
        setUsers(users.map((user) => (user.userId === updatedUser.userId ? updatedUser : user)));
        handleCloseModal();
    } catch (err) {
        console.error('Error updating user:', err);
        setError(new Error('Failed to update user.'));
    }
};

  // lavrikova.el@gmail.com
  const handleUserCreate = async (newUser: User) => {
    try {
        const createdUser = await createUser(tenantId, apiKey, newUser);

        const roles = newUser.authorization[tenantId].roles;
        if (roles) {
            await updateUserRoles(tenantId, apiKey, createdUser.userId, { roles });
        }

        const userExt = {
            ...createdUser,
            roles: roles.join(', ')
        };
        setUsers([...users, userExt]);
        handleCloseModal();
    } catch (err) {
        console.error('Error creating user:', err);
        setError(new Error('Failed to create user.'));
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete user with ID ' + userId + '?')) {
      return;
    }

    try {
      await deleteUser(tenantId, apiKey, userId);
      setUsers(users.filter((user) => user.userId !== userId));
    } catch (err) {
        console.error('Error deleting user:', err);
        setError(new Error('Failed to delete user.'));
    }
  };

  const columns = [
    { header: 'ID', accessor: 'userId' },
    { header: 'Username', accessor: 'username' },
    { header: 'Email', accessor: 'email' },
    { header: 'Roles', accessor: 'roles' },
    {
      header: 'Actions',
      render: (user: User) => (
        <>
          <button onClick={() => handleOpenModal(user)}>Редактировать</button>
          <button onClick={() => handleDeleteUser(user.userId)}>Удалить</button>
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
      roles: userRoles(user),
    };
  });

  console.log('users', users);
  return (
    <div>
      <button onClick={() => handleOpenModal(null)}>Добавить пользователя</button>
      <Table data={usersExt} columns={columns as  any} />
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <UserForm user={selectedUser === null ? undefined : selectedUser} 
          onUpdate={handleUserUpdate} 
          onCreate={handleUserCreate} />
      </Modal>
    </div>
  );
};

export default UserList;