import React, { useState, useEffect } from 'react';
import Modal from '../Shared/Modal';
import Table from '../Shared/Table';
import UserForm from './UserForm';
import { fetchUsers, User } from '../../api/fetchUsers';
import { updateUser } from '../../api/updateUser';
import { createUser } from '../../api/createUser';
import { deleteUser } from '../../api/deleteUser';
import { tenantId, apiKey } from '../../globals_VITE';
import { updateUserRoles } from '../../api/updateUserRoles';

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [error, setError] = useState<Error | null>(null);
    // const [userToDelete, setUserToDelete] = useState<number | null>(null);

    const getUsers = async () => {
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
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    if (error) {
        return <div>Ошибка: {error.message}</div>;
    }

    const handleOpenModal = (user: User | null) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        // setUserToDelete(null);
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
            }
            await getUsers();
            handleCloseModal();
        } catch (err) {
            console.error('Error updating user:', err);
            setError(new Error('Failed to update user.'));
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
            setError(new Error('Failed to create user.'));
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
      if (!window.confirm('Are you sure you want to delete this user?')) {
        return;
      }
      try {
        await deleteUser(tenantId, apiKey, userId);
        setUsers(users.filter((user) => user.userId !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError(new Error('Failed to delete user.'));
      }
    }
    // const handleDeleteUser = (userId: number) => {
    //     setUserToDelete(userId);
    //     setIsModalOpen(true);
    // };

    // const confirmDeleteUser = async () => {
    //     if (userToDelete !== null) {
    //         try {
    //             await deleteUser(tenantId, apiKey, userToDelete);
    //             setUsers(users.filter((user) => user.userId !== userToDelete));
    //             handleCloseModal();
    //         } catch (err) {
    //             console.error('Error deleting user:', err);
    //             setError(new Error('Failed to delete user.'));
    //         }
    //     }
    // };

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

    return (
        <div>
            <button onClick={() => handleOpenModal(null)}>Добавить пользователя</button>
            <Table data={usersExt} columns={columns as any} />
            <Modal isOpen={isModalOpen}>
                <UserForm
                    user={selectedUser === null ? undefined : selectedUser}
                    title={selectedUser === null ? 'Добавить пользователя' : 'Редактировать пользователя'}  
                    onSave={handleSave}
                    onCancel={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default UserList;