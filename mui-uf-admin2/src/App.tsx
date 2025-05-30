import { useState, useEffect, JSX } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useUserfront, LoginForm, SignupForm, PasswordResetForm } from '@userfront/react'; // Import PasswordResetForm
import Users from './pages/Users';
import Dashboard from './pages/DashboardView';
import { Button, Box, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

import MainMenu from './components/Shared/MainMenu2';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
// import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import BarChartIcon from '@mui/icons-material/BarChart';
import { MenuItem } from './components/Shared/MainMenu2';
import RoleList from './components/Roles/RoleList';
import { tenantId } from './globals_VITE';
// --- Добавляем импорты для контекста, хука и API ключа ---
import { /*TenantProvider,*/ useTenant } from './context/TenantContext';
import { apiKey } from './globals_VITE'; // Импортируем apiKey
import { useDetermineChildTenant } from './hooks/useDetermineChildTenant'; // Импортируем новый хук
// --- Конец добавлений ---
import GeneralSettings from './pages/Settings/GeneralSettings';
import ReportListSettings from './pages/Settings/ReportListSettings';
// import ReportList from './pages/Reports/ReportList'; // ReportList is imported below if needed for other routes
import ReportList from './pages/Reports/ReportList';
import DepartmentList from './pages/Enterprise/components/departments/DepartmentList';
import PositionList from './pages/Enterprise/components/positions/PositionList';
import EmployeeList from './pages/Enterprise/components/employees/EmployeeList';
// import MyDashboardComponent from './pages/MyDashboardComponent';
import MyDashboardWithCircularChart from './pages/MyDashboardWithCircularChart'; // tenantId теперь берется из user
import AppFooter from './components/AppFooter';
import MyComponentWithAspectRatio from './pages/MyComponentWithAspectRatio';
import ViewerReportList from './pages/Reports/ViewerReportList'; // Import the new ViewerReportList
import DashboardWrapper from './pages/DashboardWrapper';

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
    // {
    //   text: 'Главная',
    //   path: '/',
    //   icon: <HomeIcon />,
    // },
    {
      text: 'Дашборд',
      path: '/dashboard',
      icon: <DashboardIcon />,
      role: 'viewer',
    },
    {
      text: 'Панель управління (пропорційна)',
      path: '/dashboard_aspect_ratio',
      icon: <DashboardIcon />,
      role: 'admin',
    },
    {
      text: 'Пример круговой диаграммы',
      path: '/testdashboard',
      icon: <DashboardIcon />,
      role: 'admin',
    },
    {
      text: 'Пример пропорции',
      path: '/testdashboard_aspect_ratio',
      icon: <DashboardIcon />,
      role: 'admin',
    },
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
        { text: 'Сотрудники', path: '/enterprise/employees', icon: <PeopleIcon /> },
        { text: 'Изображения сотрудников', path: '/enterprise/images', icon: <PeopleIcon /> },
      ],
      role: 'owner',
    },
    {
      text: 'Звіти',
      path: '/viewerReports', // Corrected path for consistency
      icon: <BarChartIcon />,
      role: 'viewer',
    },
    {
      text: 'Звіти всі',
      path: '/reports',
      icon: <BarChartIcon />,
      role: 'admin',
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

  // --- Логика определения childTenantId ---
  // Используем новый хук для определения ID
  const { childTenantId, isLoading: isLoadingTenantId, error: tenantIdError } = useDetermineChildTenant({ user, apiKey });

  // Получаем функцию установки из контекста, чтобы сохранить найденный ID
  const { setChildTenantId } = useTenant(); // Убедись, что App обернут в TenantProvider в main.tsx или здесь

  useEffect(() => {
    if (tokens && tokens.accessToken) {
      console.log('Tokens:', tokens);
      console.log('User:', user);
      // navigate('/'); // Removed navigate on login to allow staying on current page or redirecting based on other logic if needed
    } else {
      console.log('No tokens');
    }
  }  , [tokens, user]);

  useEffect(() => {
    // Когда хук useDetermineChildTenant возвращает ID (или null),
    // обновляем значение в TenantContext
    if (!isLoadingTenantId) { // Обновляем только когда загрузка завершена
        setChildTenantId(childTenantId); // Устанавливаем значение в контекст
        if (tenantIdError) {
            console.error("Error determining child tenant ID:", tenantIdError);
            // Можно показать уведомление пользователю об ошибке
        }
    }
  }, [childTenantId, isLoadingTenantId, tenantIdError, setChildTenantId]
  ); // Зависимости для обновления контекста
  // --- Конец логики определения childTenantId ---

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  // Проверяем наличие пользователя
  if (tokens && tokens.accessToken) {
  // if (user) {
    // Можно добавить индикатор загрузки, пока определяется childTenantId
    // if (isLoadingTenantId) {
    //   return <div>Loading tenant information...</div>; // Или более сложный лоадер
    // }
    return (
      // TenantProvider теперь должен быть в main.tsx, чтобы useTenant() работал здесь
      // 1. Главный контейнер: делаем его flex-колонкой и задаем минимальную высоту
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Занимает минимум всю высоту окна
      }}>
        {/* 2. Хедер: остается как есть, не растягивается */}
        <Box display="flex" alignItems="center" justifyContent="space-between" 
          padding="1rem"
          >
          <Box display="flex">
            {/* {user.hasRole('admin') && ( */}
              <MainMenu menuItems={menuItems} drawerTitle='People Counting'/>
            {/* )} */}
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
            <Typography variant="body1">{user?.username}</Typography>
          <Button onClick={handleLogout} variant="contained" sx={{ marginLeft: '1rem' }}>
              Вийти
            </Button>
          </Box>
        </Box>

        {/* 3. Основной контент: оборачиваем Routes и даем ему flexGrow: 1 */}
        <Box id={'11111111'} sx={{
          flexGrow: 1, // Занимает оставшееся пространство
          display: 'flex', // <-- Делаем этот блок flex-контейнером
          flexDirection: 'column' // <-- Его дочерние элементы (страницы) будут в колонку
        }}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard_aspect_ratio" element={<DashboardWrapper />} />
            <Route path="/testdashboard" element={<MyDashboardWithCircularChart />} />
            <Route path="/testdashboard_aspect_ratio" element={<MyComponentWithAspectRatio />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<RoleList />} />
            <Route path="/reports" element={<ReportList />} />
            <Route path="/viewerReports" element={<ViewerReportList />} /> 
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
            {/* Add the reset route here as well in case user navigates while logged in, though typically accessed when logged out */}
            <Route path="/reset" element={<PasswordResetForm />} />
          </Routes>
        </Box>

        {/* 4. Футер: остается как есть, не растягивается и будет прижат к низу */}
        <AppFooter />
        </Box>
    );
  } else {
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        <Routes>
          <Route path="/reset" element={<PasswordResetForm />} />
          <Route path="/" element={
            <>
              {showLogin ? <LoginForm /> : <SignupForm />}
              <Button onClick={toggleForm} sx={{ marginTop: '10px' }}>
                {/* {showLogin ? 'Реєстрация' : 'Війти'} - {useUserfront()?.tenantId} Показываем ID тенанта из Userfront */}
                {showLogin ? 'Реєстрация' : 'Війти'} - {tenantId}
              </Button>
              {/* Optionally add a link to the reset form */}
              {/* <Link to="/reset">Forgot Password?</Link> */}
            </>
          } />
          {/* Redirect any other path to login when not authenticated */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    );
  }
}

export default App;
