import React from 'react';
import UserList from '../components/Users/UserList';
import { Box, Typography } from '@mui/material';

const Users: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        Пользователи
      </Typography>
      <UserList />
    </Box>
  );
};

export default Users;
