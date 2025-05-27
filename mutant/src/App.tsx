import { useState, useEffect, type JSX } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useUserfront, LoginForm, SignupForm, PasswordResetForm } from '@userfront/react'; // Import PasswordResetForm
import MainMenu, { type MenuItem } from './components/Shared/MainMenu2';
import Users from './components//Users/UserList';
import { Button, Box, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

import DashboardView from './pages/dashboard/DashboardView';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
// import HomeIcon from '@mui/icons-material/Home';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import BarChartIcon from '@mui/icons-material/BarChart';
import RoleList from './components/Roles/RoleList';
import VideocamIcon from '@mui/icons-material/Videocam'; // Используем VideocamIcon для "Реєстратори"
import GroupIcon from '@mui/icons-material/Group';
import { tenantId } from './globals_VITE';

import { /*TenantProvider,*/ useTenant } from './context/TenantContext';
import { useDetermineChildTenant } from './hooks/useDetermineChildTenant'; // Импортируем новый хук
import { apiKey } from './globals_VITE'; // Импортируем apiKey

import GeneralSettings from './pages/Settings/GeneralSettings';
import ReportListSettings from './pages/Settings/ReportListSettings';
import ReportList from './pages/Reports/ReportList';
import DepartmentList from './pages/Enterprise/components/departments/DepartmentList';
import PositionList from './pages/Enterprise/components/positions/PositionList';
import EmployeeList from './pages/Enterprise/components/employees/EmployeeList';
import AppFooter from './components/AppFooter';
import ViewerReportList from './pages/Reports/ViewerReportList';
import PointList from './components/Points/PointList';
import OriginView from './components/Origins/OriginView';
import { CustomerData, CustomerProvider, } from './context/CustomerContext';
// import { CustomerData, CustomerProvider, type CustomerPoint } from './context/CustomerContext';
// import { loadCustomerData } from './api/data/customerDataLoader';
import { getPoints } from './api/data/customerTools';
import GroupList from './components/Groups/GroupList';

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
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isLoadingCustomerData, setIsLoadingCustomerData] = useState(true);  
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  
  const menuItems0: MenuItem[] = [
    // {
    //   text: 'Главная',
    //   path: '/',
    //   icon: <HomeIcon />,
    // },
    {
      text: 'Дашборд', // Already Ukrainian, but confirming
      path: '/dashboard',
      icon: <DashboardIcon />,
      role: 'viewer',
    },
    {
      text: 'Адміністрування',
      icon: <AdminPanelSettingsIcon />,
      items: [
        { text: 'Користувачі', path: '/users', icon: <PeopleIcon /> },
        { text: 'Ролі', path: '/roles', icon: <BadgeIcon /> },
        { text: 'Пункти обліку', path: '/points', icon: <BadgeIcon />, role: 'admin' },
        { text: 'Реєстратори', path: '/origins', icon: <VideocamIcon />, role: 'admin' },
        { text: 'Групи', path: '/groups', icon: <GroupIcon />, role: 'admin' },
      ],
      role: 'admin',
    },
    {
      text: 'Підприємство',
      icon: <AdminPanelSettingsIcon />,
      items: [
        { text: 'Підрозділи', path: 'enterprise/departments', icon: <BadgeIcon /> },
        { text: 'Посади', path: '/enterprise/positions', icon: <BadgeIcon /> },
        { text: 'Співробітники', path: '/enterprise/employees', icon: <PeopleIcon /> },
        { text: 'Зображення співробітників', path: '/enterprise/images', icon: <PeopleIcon /> },
      ],
      role: 'owner',
    },
    {
      text: 'Звіти', // Already Ukrainian
      path: '/viewerReports', // Corrected path for consistency
      icon: <BarChartIcon />,
      role: 'viewer',
    },
    {
      text: 'Звіти всі', // Already Ukrainian
      path: '/reports',
      icon: <BarChartIcon />,
      role: 'admin',
    },
    {
      text: 'Налаштування',
      icon: <SettingsIcon />,
      items: [
        { text: 'Загальні', path: '/settings/general' },
        { text: 'Редактор звітів', path: '/settings/report-list' },
      ],
      role: 'editor',
    },
  ];

  const { tokens, user, logout, isLoading: isUserfrontLoading } = useUserfront(); // Destructure isLoading here
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
    } else {
      console.log('No tokens');
    }
    
    if (!isUserfrontLoading) { // Use the destructured isLoading
      setIsLoadingCustomerData(false); 

      if (user && user.data) {
        // Extract customer and point_id if user and user.data are available
        setCustomerData({
          customer: user.data.customer as number | undefined,
          point_id: user.data.point_id as number | undefined,
        });
        console.log('[App] Extracted customer data:', { customer: user.data.customer, point_id: user.data.point_id });
      } else {
        // User is null or has no data, set customerData to null
        setCustomerData(null);
      }
    }
  }, [tokens, user, isUserfrontLoading]); // Add isUserfrontLoading to dependencies

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
  
  // Effect to fetch points when customerData.customer is set or changes
  useEffect(() => {
    const loadPoints = async () => {
      console.log('[App] isLoadingPoints:', isLoadingPoints);
      if (customerData?.customer) {
        setIsLoadingPoints(true);
        try {
          console.log(`[App] Fetching points for customer ID: ${customerData.customer}`);
          const customerAsNumber = Number(customerData.customer);
          const points = (await getPoints(customerAsNumber)).map((point => ({
            value: (point as any).point_id,
            label: (point as any).name,
          })));
          setCustomerData(prevData => prevData ? { ...prevData, points } : null);
          console.log(`[App] Fetched points for customer ${customerData.customer}:`, points);
        } catch (error) {
          console.error(`[App] Error fetching points for customer ${customerData.customer}:`, error);
          setCustomerData(prevData => prevData ? { ...prevData, points: [] } : null); // Set empty on error or handle appropriately
        } finally {
          setIsLoadingPoints(false);
        }
      } else if (customerData && customerData.points !== undefined) {
        // If customer becomes null/undefined, and points were previously set, clear them.
        setCustomerData(prevData => prevData ? { ...prevData, points: undefined } : null);
        setIsLoadingPoints(false);
      }
    };
    loadPoints();

    // const load = async () => {
    //   if (customerData?.customer) {
    //     const loadedCustomerData = await loadCustomerData(Number(customerData.customer));
    //     console.log(`[App] loadedCustomerData for customer ${customerData.customer}:`, loadedCustomerData);
    //     setCustomerData(prevData => prevData ? { 
    //       ...prevData, 
    //       points: loadedCustomerData?.points || [],
    //       point_id: loadedCustomerData?.point_id || -1,
    //       country: loadedCustomerData?.country || '',
    //       city: loadedCustomerData?.city || '',
    //     } : null)
    //   } else {
    //     setCustomerData({});
    //   }
    // }
    // load();
  }, [customerData?.customer]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  const appTitle = 'People Counting (multi-user)';

  // Проверяем наличие пользователя
  if (tokens && tokens.accessToken) {
  // if (user) {
    // Можно добавить индикатор загрузки, пока определяется childTenantId
    // if (isLoadingTenantId) {
    //   return <div>Loading tenant information...</div>; // Или более сложный лоадер
    // +    // return <div>Loading tenant information... {isLoadingPoints && "(Loading points...)"}</div>; // Или более сложный лоадер
    // }
    return (
      // TenantProvider теперь должен быть в main.tsx, чтобы useTenant() работал здесь
      <CustomerProvider customerData={customerData} isLoading={isLoadingCustomerData}>
      {/* 1. Главный контейнер: делаем его flex-колонкой и задаем минимальную высоту */}
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
              <MainMenu menuItems={menuItems} drawerTitle={appTitle} />
            {/* )} */}
            <Typography
              variant="h5"
              component="div"
              sx={{ fontWeight: 'bold', marginLeft: '1rem', marginTop: '0.5rem' }}
            >
              {appTitle}
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
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<RoleList />} />
            <Route path="/points" element={<ProtectedRoute user={user} requiredRole="admin"><PointList /></ProtectedRoute>} />
            <Route path="/origins" element={<ProtectedRoute user={user} requiredRole="admin"><OriginView /></ProtectedRoute>} />
            <Route path="/groups" element={<ProtectedRoute user={user} requiredRole="admin"><GroupList /></ProtectedRoute>} />
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
            <Route path="/" element={<DashboardView />} />
            {/* Add the reset route here as well in case user navigates while logged in, though typically accessed when logged out */}
            <Route path="/reset" element={<PasswordResetForm />} />
          </Routes>
        </Box>

        {/* 4. Футер: остается как есть, не растягивается и будет прижат к низу */}
        <AppFooter />
      </Box>
      </CustomerProvider>
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
                {showLogin ? 'Реєстрація' : 'Увійти'} - {tenantId}
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
