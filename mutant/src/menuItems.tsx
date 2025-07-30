// src/menuItems.tsx
import { type MenuItem } from "./components/Shared/SideBar";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SourceIcon from "@mui/icons-material/Source";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import BadgeIcon from "@mui/icons-material/Badge";
import SettingsIcon from "@mui/icons-material/Settings";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import LogoutIcon from "@mui/icons-material/Logout";

/**
 * Generates the menu items based on the user's roles and name.
 * @param user The Userfront user object.
 * @returns An array of MenuItem objects.
 */
export const getMenuItems = (user: any | null): MenuItem[] => {
  const baseMenuItems: MenuItem[] =
    user?.name === "demo"
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
        { text: "Парметри Системи", path: "/settings/sysparam", icon: <SettingsIcon />, },
        { text: "Парметри Системи", path: "/settings/sysparam", icon: <SettingsIcon />, },
        { text: "Стан Системи", path: "/settings/sysstate", icon: <MonitorHeartIcon />, },
        { text: "Стан Системи (Метрики)", path: "/settings/sysmetric", icon: <MonitorHeartIcon />, },
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
    user?.name === "demo"
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

  return currentMenuItems;
};