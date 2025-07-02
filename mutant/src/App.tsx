import { useState, useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserfront } from '@userfront/react';
import { type MenuItem } from './components/Shared/SideBar';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SourceIcon from '@mui/icons-material/Source';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import BadgeIcon from '@mui/icons-material/Badge';
import SettingsIcon from '@mui/icons-material/Settings';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';

import { CustomerData } from './context/CustomerContext';
import AppCustomer from './AppCustomer';
import AppNewbie from './AppNewbie';
import { getCustomer, getPoints } from './api/data/customerTools';
import { Box } from '@mui/material';
import { setApiToken } from './api/data/fetchData';

function App(): JSX.Element {
  const navigate = useNavigate();
  const Userfront = useUserfront();
  const tokens = Userfront.tokens;
  const user = Userfront.user;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isLoadingCustomerData, setIsLoadingCustomerData] = useState<boolean>(true);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  // const [customerName, setCustomerName] = useState<string>('');

  const appTitle = 'People Counting / multiuser';

  const isUserfrontLoading = typeof Userfront.user === 'undefined';

  useEffect(() => {
    document.title = appTitle;
  }, [appTitle]);

  useEffect(() => {
    if (Userfront.tokens.accessToken && user?.userId) {
      console.log('Tokens:', tokens);
      console.log('User:', user);
      console.log('Tenant ID:', Userfront.tenantId);
      console.log('Userfront mode:', Userfront.mode);
      console.log('User roles:', user.hasRole && typeof user.hasRole === 'function' ? {
        admin: user.hasRole('admin'),
        editor: user.hasRole('editor'),
        owner: user.hasRole('owner')
      } : 'hasRole function not available');
      setApiToken(Userfront.tokens.accessToken);
    } else {
      console.log('No tokens');
      setApiToken(null);
    }

    if (!isUserfrontLoading) {
      setIsLoadingCustomerData(false);

      if (user && user.data && typeof user.data === 'object') {
        const newCustomerData = {
          customer: user.data.customer as number | undefined,
          point_id: user.data.point_id as number | undefined,
        };
        setCustomerData(newCustomerData as CustomerData);
        console.log('[App] Extracted customer data:', newCustomerData);
      } else {
        setCustomerData(null);
        console.log('[App] User object or user.data is not available for customer data extraction.');
      }
    } else {
      setIsLoadingCustomerData(true);
    }
  }, [tokens, user, isUserfrontLoading]);

  useEffect(() => {
    const baseMenuItems: MenuItem[] = [
      { text: 'Дашборд', path: '/dashboard', icon: <DashboardIcon /> },
      { text: 'Реклама', path: '/adverts', icon: <EmojiPeopleIcon /> },
      { text: 'Звіти', path: '/reports', icon: <AssessmentIcon /> },
    ];

    const adminMenuItems: MenuItem[] = [
      {
        text: 'Адміністрування',
        icon: <AdminPanelSettingsIcon />,
        items: [
          { text: 'Парметри Системи', path: '/settings/sysparam', icon: <SettingsIcon /> },
          { text: 'Стан Системи', path: '/settings/sysstate', icon: <MonitorHeartIcon /> },
          { text: 'Стан Системи (Метрики)', path: '/settings/sysmetric', icon: <MonitorHeartIcon /> },
          { text: 'Користувачі', path: '/users', icon: <PeopleIcon /> },
          { text: 'Ролі', path: '/roles', icon: <AssignmentIndIcon /> },
          { text: 'Пункти обліку', path: '/points', icon: <LocationOnIcon /> },
          { text: 'Джерела', path: '/origins', icon: <SourceIcon /> },
          { text: 'Групи', path: '/groups', icon: <GroupWorkIcon /> },
          { text: 'Персони', path: '/persons', icon: <PersonIcon /> },
          { text: 'Звіти', path: '/settings/report-list', icon: <AssessmentIcon /> },
          
          { text: 'Клієнти', path: '/customers', icon: <ShoppingCartIcon /> },
          { text: 'Форми', path: '/forms', icon: <DescriptionIcon /> },
        ],
      },
    ];

    const enterpriseMenuItems: MenuItem[] = [
      {
        text: 'Підприємство',
        icon: <BusinessIcon />,
        items: [
          { text: 'Підрозділи', path: '/enterprise/departments', icon: <BusinessIcon /> },
          { text: 'Посади', path: '/enterprise/positions', icon: <WorkIcon /> },
          { text: 'Співробітники', path: '/enterprise/employees', icon: <BadgeIcon /> },
        ],
      },
    ];

    const settingsMenuItems: MenuItem[] = user.name === 'demo' ? [
      {
        text: 'Налаштування',
        icon: <SettingsIcon />,
        items: [
          { text: 'Загальні', path: '/settings/general', icon: <SettingsIcon /> },
          // { text: 'Пункти обліку', path: '/points', icon: <LocationOnIcon /> },
          // { text: 'Групи Персон', path: '/groups', icon: <GroupWorkIcon /> },
          // { text: 'Персони', path: '/persons', icon: <PersonIcon /> },
          // { text: 'Користувачі', path: '/users', icon: <PeopleIcon /> },
        ],
      },
    ] : [
      {
        text: 'Налаштування',
        icon: <SettingsIcon />,
        items: [
          { text: 'Загальні', path: '/settings/general', icon: <SettingsIcon /> },
          { text: 'Пункти обліку', path: '/points', icon: <LocationOnIcon /> },
          { text: 'Групи Персон', path: '/groups', icon: <GroupWorkIcon /> },
          { text: 'Персони', path: '/persons', icon: <PersonIcon /> },
          { text: 'Користувачі', path: '/users', icon: <PeopleIcon /> },
        ],
      },
    ];

    let currentMenuItems = [...baseMenuItems];

    if (user?.hasRole('admin')) {
      currentMenuItems = [...currentMenuItems, ...adminMenuItems];
    }
    if (user?.hasRole('owner')) {
      currentMenuItems = [...currentMenuItems, ...enterpriseMenuItems];
    }
    currentMenuItems = [...currentMenuItems, ...settingsMenuItems];

    setMenuItems(currentMenuItems);
  }, [user, Userfront.tokens.accessToken]);

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
          setCustomerData(prevData => prevData ? { ...prevData, points: [] } : null);
        } finally {
          setIsLoadingPoints(false);
        }
      } else if (customerData && customerData.points !== undefined) {
        setCustomerData(prevData => prevData ? { ...prevData, points: undefined } : null);
        setIsLoadingPoints(false);
      }
    };
    loadPoints();

    const loadCustomerName = async () => {
      const dbCustomer = await getCustomer(customerData?.customer || 0);
      if (dbCustomer && dbCustomer.length > 0) {
        document.title = ` ${appTitle} - ${dbCustomer[0].legal_name}`;
      }
    }
    loadCustomerName();

  }, [customerData?.customer]);

  const handleLogout = () => {
    Userfront.logout();
    navigate('/login');
  };

  if (typeof Userfront.user === 'undefined') {
    return <div>Завантаження Userfront...</div>;
  }

  if (!Userfront.tokens.accessToken || !user) {
    return <AppNewbie appTitle={appTitle} />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <AppCustomer
        user={user}
        menuItems={menuItems}
        appTitle={appTitle}
        onLogout={handleLogout}
        customerData={customerData}
        isLoadingCustomerData={isLoadingCustomerData}
      />
    </Box>
  );
}

export default App;
