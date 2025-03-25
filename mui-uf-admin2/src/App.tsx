import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { useUserfront, LoginForm, SignupForm } from '@userfront/react';
import Users from './pages/Users';
import Dashboard from './pages/Dashboard';
import { Button, Box, List, ListItem } from '@mui/material';

function App() {
  const { tokens, user, logout } = useUserfront();
  const [showLogin, setShowLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (tokens && tokens.accessToken) {
      console.log('Tokens:', tokens);
      console.log('User:', user);
      navigate('/');
    } else {
      console.log('No tokens');
    }
  }, [tokens, user, /*navigate*/]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  if (tokens && tokens.accessToken) {
    return (
      <Box>
        <p>Пользователь: {user?.email}</p>
        <Button onClick={handleLogout}>Выйти</Button>
        <nav>
          <List>
            <ListItem>
              <Link to="/dashboard">Dashboard</Link>
            </ListItem>
            <ListItem>
              <Link to="/users">Users</Link>
            </ListItem>
          </List>
        </nav>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/" element={<Users />} />
        </Routes>
      </Box>
    );
  } else {
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        {showLogin ? <LoginForm /> : <SignupForm />}
        <Button onClick={toggleForm} sx={{ marginTop: '10px' }}>
          {showLogin ? 'Регистрация' : 'Войти'}
        </Button>
      </Box>
    );
  }
}

export default App;
