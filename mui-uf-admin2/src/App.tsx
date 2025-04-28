import { useState, useEffect, JSX } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useUserfront, LoginForm, SignupForm } from '@userfront/react';
import Users from './pages/Users';
import Dashboard from './pages/DashboardView';
import { Button, Box, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

import MainMenu from './components/Shared/MainMenu2';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import BarChartIcon from '@mui/icons-material/BarChart';
import { MenuItem } from './components/Shared/MainMenu2';
import RoleList from './components/Roles/RoleList';
import GeneralSettings from './pages/Settings/GeneralSettings';
import ReportListSettings from './pages/Settings/ReportListSettings';
import ReportList from './pages/Reports/ReportList';
import DepartmentList from './pages/Enterprise/components/departments/DepartmentList';
import PositionList from './pages/Enterprise/components/positions/PositionList';
import EmployeeList from './pages/Enterprise/components/employees/EmployeeList';
// import MyDashboardComponent from './pages/MyDashboardComponent';
import MyDashboardWithCircularChart from './pages/MyDashboardWithCircularChart';
import { tenantId } from './globals_VITE';
import AppFooter from './components/AppFooter';

// Helper function to check if the user has the 'admin' role
// const hasAdminRole = (user: any): boolean => {
//     if (!user || !user.data || !user.data.roles) {
//       return false;
//     }
//     return user.data.roles.includes('admin');
// };

// Protected Route Component
const ProtectedRoute = ({
  user,
  requiredRole,
  children,
}: {
  user: any;
  requiredRole: string;
  children: JSX.Element;
}) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && !user.hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const menuItems0: MenuItem[] = [
    {
      text: 'Главная',
      path: '/',
      icon: <HomeIcon />,
    },
    {
      text: 'Панель управління',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    // {
    //   text: 'test Панель управления',
    //   path: '/testdashboard',
    //   icon: <DashboardIcon />,
    // },    
    {
      text: 'Администрирование',
      icon: <AdminPanelSettingsIcon />,
      items: [
        { text: 'Пользователи', path: '/users', icon: <PeopleIcon /> },
        { text: 'Роли', path: '/roles', icon: <BadgeIcon /> },
      ],
      role: 'admin',
    },
    {
      text: 'Предприятие',
      icon: <AdminPanelSettingsIcon />,
      items: [
        { text: 'Подразделения', path: 'enterprise/departments', icon: <BadgeIcon /> },
        { text: 'Должности', path: '/enterprise/positions', icon: <BadgeIcon /> },
        { text: 'Сотруники', path: '/enterprise/employees', icon: <PeopleIcon /> },
        { text: 'Изображения сотрудников', path: '/enterprise/images', icon: <PeopleIcon /> },
      ],
    },
    {
      text: 'Отчеты',
      path: '/reports',
      icon: <BarChartIcon />,
    },
    {
      text: 'Настройки',
      icon: <SettingsIcon />,
      items: [
        { text: 'Общее', path: '/settings/general' },
        { text: 'Редактор отчетов', path: '/settings/report-list' },
      ],
      role: 'editor',
    },
  ];
  
  const { tokens, user, logout } = useUserfront();
  const [showLogin, setShowLogin] = useState(true);
  const navigate = useNavigate();

  const menuItems: MenuItem[] = menuItems0.filter((item => {
    if (item.role) {
      return user?.hasRole(item.role);
    }
    return true;
  }));
  
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
          <Box display="flex">
            {user.hasRole('admin') && (
              <MainMenu menuItems={menuItems} />
            )}
            <Typography
              variant="h5"
              component="div"
              sx={{ fontWeight: 'bold', marginLeft: '1rem', marginTop: '0.5rem' }}
            >
              People Counting
            </Typography>
          </Box>

          <Box display="flex" alignItems="center">
            {/* <Typography variant="body1">Користувач: {user?.email}</Typography> */}
            <Typography variant="body1">{user?.email}</Typography>
          <Button onClick={handleLogout} variant="contained" sx={{ marginLeft: '1rem' }}>
              Вийти
            </Button>
          </Box>
        </Box>

        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/testdashboard" element={<MyDashboardWithCircularChart />} />
          <Route path="/users" element={<Users />} />
          <Route path="/roles" element={<RoleList />} />
          <Route path="/reports" element={<ReportList />} />
          <Route path="/settings/general" element={<GeneralSettings />} />
          {/* <Route path="/settings/report-list" element={<ReportListSettings />} /> */}
          {/* Protected Route for ReportListSettings */}
          <Route
            path="/settings/report-list"
            element={
              <ProtectedRoute user={user} requiredRole="editor">
                <ReportListSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enterprise/departments"
            element={
              <ProtectedRoute user={user} requiredRole="owner">
                <DepartmentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enterprise/positions"
            element={
              <ProtectedRoute user={user} requiredRole="owner">
                <PositionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enterprise/employees"
            element={
              <ProtectedRoute user={user} requiredRole="owner">
                <EmployeeList />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Dashboard />} />
        </Routes>
        <AppFooter />
      </Box>
    );
  } else {
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        {showLogin ? <LoginForm /> : <SignupForm />}
        <Button onClick={toggleForm} sx={{ marginTop: '10px' }}>
          {showLogin ? 'Реєстрация' : 'Війти'} - {tenantId}
        </Button>
      </Box>
    );
  }
}

export default App;
