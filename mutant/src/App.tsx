import { useState, useEffect, type JSX, createContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserfront } from "@userfront/react";
import { type MenuItem } from "./components/Shared/SideBar";

import { CustomerData } from "./context/CustomerContext";
import AppCustomer from "./AppCustomer";
import AppNewbie from "./AppNewbie";
import { getCustomer } from "./api/data/customerTools";
import { Box, createTheme, ThemeProvider } from "@mui/material";
import { setApiToken } from "./api/data/fetchData";
import { pointApi } from "./api/data/pointApi";
import axios from "axios";
import { getMenuItems } from "./menuItems_i18n";
import { useTranslation } from "react-i18next";
import { ThemeToggleButton, ColorModeContext } from './components/Shared/ThemeToggleButton';
import { DbThemeProvider } from "./components/themes/DbThemeContext";

function App(): JSX.Element {
  const navigate = useNavigate();
  const Userfront = useUserfront();
  const tokens = Userfront.tokens;
  const user = Userfront.user;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isLoadingCustomerData, setIsLoadingCustomerData] =
    useState<boolean>(true);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const appTitle = "People Counting / multiuser";

  const isUserfrontLoading = typeof Userfront.user === "undefined";

  const [mode, setMode] = useState<'light' | 'dark'>('light');
  // Мемоизируем объект контекста, чтобы избежать лишних ререндеров
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );
  
  // Мемоизируем объект темы
  // Тема будет пересоздаваться ТОЛЬКО когда меняется 'mode'
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode, // <--- Здесь используется актуальное состояние 'mode'
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          ...(mode === 'dark' && {
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: '#ffffff',
              secondary: '#cccccc',
            },
          }),
        },
        typography: {
          fontFamily: 'Roboto, sans-serif',
          // Другие настройки типографики
        },
        // Другие настройки компонентов, spacing и т.д.
      }),
    [mode], // тема пересоздается при изменении 'mode'
  );

  useEffect(() => {
    document.title = appTitle;
  }, [appTitle]);

  useEffect(() => {
    if (Userfront.tokens.accessToken && user?.userId) {
      console.log("Tokens:", tokens);
      console.log("User:", user);
      console.log("Tenant ID:", Userfront.tenantId);
      console.log("Userfront mode:", Userfront.mode);
      console.log(
        "User roles:",
        user.hasRole && typeof user.hasRole === "function"
          ? {
              admin: user.hasRole("admin"),
              editor: user.hasRole("editor"),
              owner: user.hasRole("owner"),
            }
          : "hasRole function not available"
      );

      // obsolete: to be replaced in future versions with axios
      setApiToken(Userfront.tokens.accessToken); // Set the API token for fetch API

      axios.defaults.headers.common["Content-Type"] = "application/json";
      axios.defaults.headers.common["Authorization"] = `Bearer ${Userfront.tokens.accessToken}`;
      axios.defaults.baseURL = "https://cnt.theweb.place/api/pcnt/";
    } else {
      console.log("No tokens");
      setApiToken(null);
    }

    if (!isUserfrontLoading) {
      setIsLoadingCustomerData(false);

      if (user && user.data && typeof user.data === "object") {
        const newCustomerData = {
          customer: user.data.customer as number | undefined,
          point_id: user.data.point_id as number | undefined,
        };
        setCustomerData(newCustomerData as CustomerData);
        console.log("[App] Extracted customer data:", newCustomerData);
      } else {
        setCustomerData(null);
        console.log("[App] User object or user.data is not available for customer data extraction.");
      }
    } else {
      setIsLoadingCustomerData(true);
    }
  }, [tokens, user, isUserfrontLoading]);

  const { t } = useTranslation();
  useEffect(() => {
    setMenuItems(getMenuItems(user,t));
  }, [user, t]); // The menu items depend on the user object and translation function

  /*useEffect(() => {
    const baseMenuItems: MenuItem[] =
      user.name === "demo"
        ? [
            { text: "Дашборд", path: "/dashboard", icon: <DashboardIcon /> },
            { text: "Звіти", path: "/reports", icon: <AssessmentIcon /> },
          ]
        : [
            { text: "Дашборд", path: "/dashboard", icon: <DashboardIcon /> },
            { text: "Реклама", path: "/adverts", icon: <EmojiPeopleIcon /> },
            { text: "Звіти", path: "/reports", icon: <AssessmentIcon /> },
          ];

    const adminMenuItems: MenuItem[] = [
      {
        text: "Адміністрування",
        icon: <AdminPanelSettingsIcon />,
        items: [
          {
            text: "Парметри Системи",
            path: "/settings/sysparam",
            icon: <SettingsIcon />,
          },
          {
            text: "Стан Системи",
            path: "/settings/sysstate",
            icon: <MonitorHeartIcon />,
          },
          {
            text: "Стан Системи (Метрики)",
            path: "/settings/sysmetric",
            icon: <MonitorHeartIcon />,
          },
          { text: "Вибір клієнта", path: "/selectCustomer", icon: <BusinessIcon /> },
          { text: "Користувачі", path: "/users", icon: <PeopleIcon /> },
          { text: "Ролі", path: "/roles", icon: <AssignmentIndIcon /> },
          { text: "Пункти обліку", path: "/points", icon: <LocationOnIcon /> },
          { text: "Джерела", path: "/origins", icon: <SourceIcon /> },
          { text: "Групи", path: "/groups", icon: <GroupWorkIcon /> },
          { text: "Персони", path: "/persons", icon: <PersonIcon /> },
          {
            text: "Звіти",
            path: "/settings/report-list",
            icon: <AssessmentIcon />,
          },

          { text: "Клієнти", path: "/customers", icon: <ShoppingCartIcon /> },
          { text: "Форми", path: "/forms", icon: <DescriptionIcon /> },
        ],
      },
    ];

    const enterpriseMenuItems: MenuItem[] = [
      {
        text: "Підприємство",
        icon: <BusinessIcon />,
        items: [
          {
            text: "Підрозділи",
            path: "/enterprise/departments",
            icon: <BusinessIcon />,
          },
          { text: "Посади", path: "/enterprise/positions", icon: <WorkIcon /> },
          {
            text: "Співробітники",
            path: "/enterprise/employees",
            icon: <BadgeIcon />,
          },
        ],
      },
    ];

    const settingsMenuItems: MenuItem[] =
      user.name === "demo"
        ? [
            {
              text: "Налаштування",
              icon: <SettingsIcon />,
              items: [
                {
                  text: "Загальні",
                  path: "/settings/general",
                  icon: <SettingsIcon />,
                },
                {
                  text: "Пункти обліку",
                  path: "/points",
                  icon: <LocationOnIcon />,
                },
                // { text: 'Групи Персон', path: '/groups', icon: <GroupWorkIcon /> },
                // { text: 'Персони', path: '/persons', icon: <PersonIcon /> },
                // { text: 'Користувачі', path: '/users', icon: <PeopleIcon /> },
              ],
            },
          ]
        : [
            {
              text: "Налаштування",
              icon: <SettingsIcon />,
              items: [
                {
                  text: "Загальні",
                  path: "/settings/general",
                  icon: <SettingsIcon />,
                },
                {
                  text: "Пункти обліку",
                  path: "/points",
                  icon: <LocationOnIcon />,
                },
                {
                  text: "Групи Персон",
                  path: "/groups",
                  icon: <GroupWorkIcon />,
                },
                { text: "Персони", path: "/persons", icon: <PersonIcon /> },
                { text: "Користувачі", path: "/users", icon: <PeopleIcon /> },
              ],
            },
          ];

    let currentMenuItems = [...baseMenuItems];

    if (user?.hasRole("admin")) {
      currentMenuItems = [...currentMenuItems, ...adminMenuItems];
    }
    if (user?.hasRole("owner")) {
      currentMenuItems = [...currentMenuItems, ...enterpriseMenuItems];
    }
    currentMenuItems = [
      ...currentMenuItems,
      ...settingsMenuItems,
      { text: `Вийти ( ${user?.name} )`, path: "/logout", icon: <LogoutIcon /> },
    ];

    setMenuItems(currentMenuItems);
  }, [user, Userfront.tokens.accessToken]);*/

  useEffect(() => {
    const loadPoints = async () => {
      console.log("[App] isLoadingPoints:", isLoadingPoints);
      if (customerData?.customer) {
        setIsLoadingPoints(true);
        try {
          console.log(`[App] Fetching points for customer ID: ${customerData.customer}`);

          // const customerAsNumber = Number(customerData.customer);
          // const points = (await getPoints(customerAsNumber)).map((point => ({
          const points = (await pointApi.getPoints()).map((point) => ({
            value: (point as any).point_id,
            label: (point as any).name,
          }));

          setCustomerData((prevData) =>
            prevData ? { ...prevData, points } : null
          );
          console.log(`[App] Fetched points for customer ${customerData.customer}:`,points);
        } catch (error) {
          console.error(
            `[App] Error fetching points for customer ${customerData.customer}:`,
            error
          );
          setCustomerData((prevData) =>
            prevData ? { ...prevData, points: [] } : null
          );
        } finally {
          setIsLoadingPoints(false);
        }
      } else if (customerData && customerData.points !== undefined) {
        setCustomerData((prevData) => prevData ? { ...prevData, points: undefined } : null);
        setIsLoadingPoints(false);
      }
    };

    const loadCustomerName = async () => {
      const dbCustomer = await getCustomer(customerData?.customer || 0);
      if (dbCustomer && dbCustomer.length > 0) {
        document.title = ` ${appTitle} - ${dbCustomer[0].legal_name}`;
      }
    };

    console.log("[App] customerData:", customerData);
    if(customerData) {
      if (customerData.customer) {
        loadPoints();
        loadCustomerName();
      } else {
        navigate("/settings/general");
      }
    } else {
      if (!user.data?.customer || 0) {
        navigate("/settings/general");
      }
    }

  // }, [customerData]); // 2025-07-17 так зацикливается!!!
  }, [customerData?.customer]); 

  const handleLogout = () => {
    Userfront.logout();
    navigate("/login");
  };

  if (typeof Userfront.user === "undefined") {
    return <div>Завантаження Userfront...</div>;
  }

  if (!Userfront.tokens.accessToken || !user) {
    return <AppNewbie appTitle={appTitle} />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <ColorModeContext.Provider value={colorMode}>
      <DbThemeProvider>
      <ThemeProvider theme={theme}>
        <AppCustomer
          user={user}
          menuItems={menuItems}
          appTitle={appTitle}
          onLogout={handleLogout}
          customerData={customerData}
          isLoadingCustomerData={isLoadingCustomerData}
        />
      </ThemeProvider>
      </DbThemeProvider>
      </ColorModeContext.Provider>
    </Box>
  );
}

export default App;
