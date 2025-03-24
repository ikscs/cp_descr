import React from 'react';
import UserList from '../components/Users/UserList';

const Users: React.FC = () => {
  return (
    <div>
      <h2>Пользователи</h2>
      <UserList />
    </div>
  );
};

export default Users;