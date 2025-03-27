import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate,  } from 'react-router-dom';
import { useUserfront, LoginForm, SignupForm } from '@userfront/react';
import Users from './pages/Users';
// import Dashboard from './pages/Dashboard';
import Dashboard from './pages/DashboardView';
import { Button, Box, Typography } from '@mui/material';

import MainMenu from './components/Shared/MainMenu2';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import BarChartIcon from '@mui/icons-material/BarChart';
import { MenuItem } from './components/Shared/MainMenu2';
import RoleList from './components/Roles/RoleList';

function App() {
  // const menuItems = [
  //   { text: 'Панель управления', path: '/dashboard', icon: <DashboardIcon /> },
  //   { text: 'Пользователи', path: '/users', icon: <PeopleIcon /> },
  //   // Add more menu items as needed
  // ];
  const menuItems: MenuItem[] = [
    {
      text: 'Главная',
      path: '/',
      icon: <HomeIcon />,
    },
    {
      text: 'Панель управления',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      text: 'Администрирование',
      icon: <AdminPanelSettingsIcon />,
      items: [
        { text: 'Пользователи', path: '/users', icon: <PeopleIcon /> },
        { text: 'Роли', path: '/roles', icon: <BadgeIcon /> },
      ],
    },
    {
      text: 'Отчеты',
      path: '/reports',
      icon: <BarChartIcon />,
    },
  ];
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
        <Box display="flex" alignItems="center" justifyContent="space-between" padding="1rem">
          
          <Box display="flex" >
            <MainMenu menuItems={menuItems} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', marginLeft: '1rem', marginTop: '0.5rem'}}>
              Админ-панель
            </Typography>
          </Box>

          <Box display="flex" alignItems="center"> {/* Added display: flex and alignItems: center */}
            <Typography variant="body1">Пользователь: {user?.email}</Typography>
            <Button onClick={handleLogout} variant="contained" sx={{ marginLeft: '1rem' }}>Выйти</Button>
          </Box>
        </Box>

        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/roles" element={<RoleList />} />
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
