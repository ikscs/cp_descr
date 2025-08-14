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
import ColorLensIcon from "@mui/icons-material/ColorLens";
import { TFunction } from "i18next";
import { Payment } from "@mui/icons-material";

/**
 * Generates the menu items based on the user's roles and name.
 * @param user The Userfront user object.
 * @param t The i18next translation function.
 * @returns An array of MenuItem objects.
 */
export const getMenuItems = (user: any | null, t: TFunction): MenuItem[] => {
  const baseMenuItems: MenuItem[] =
    user?.name === "demo"
      ? [
          { text: t("menu.dashboard"), path: "/dashboard", icon: <DashboardIcon /> },
          { text: t("menu.reports"), path: "/reports", icon: <AssessmentIcon /> },
        ]
      : [
          { text: t("menu.dashboard"), path: "/dashboard", icon: <DashboardIcon /> },
          { text: t("menu.adverts"), path: "/adverts", icon: <EmojiPeopleIcon /> },
          { text: t("menu.reports"), path: "/reports", icon: <AssessmentIcon /> },
        ];

  const adminMenuItems: MenuItem[] = [
    {
      text: t("menu.administration"),
      icon: <AdminPanelSettingsIcon />,
      items: [
        { text: t("menu.themes"), path: "/settings/themes", icon: <ColorLensIcon />, },
        { text: t("menu.systemParameters"), path: "/settings/sysparam", icon: <SettingsIcon />, },
        { text: t("menu.systemStatus"), path: "/settings/sysstate", icon: <MonitorHeartIcon />, },
        { text: t("menu.systemMetrics"), path: "/settings/sysmetric", icon: <MonitorHeartIcon />, },
        { text: t("menu.selectClient"), path: "/selectCustomer", icon: <BusinessIcon /> },
        { text: t("menu.users"), path: "/users", icon: <PeopleIcon /> },
        { text: t("menu.roles"), path: "/roles", icon: <AssignmentIndIcon /> },
        { text: t("menu.accountingPoints"), path: "/points", icon: <LocationOnIcon /> },
        { text: t("menu.sources"), path: "/origins", icon: <SourceIcon /> },
        { text: t("menu.groups"), path: "/groups", icon: <GroupWorkIcon /> },
        { text: t("menu.persons"), path: "/persons", icon: <PersonIcon /> },
        { text: t("menu.reportsAdmin"), path: "/settings/report-list", icon: <AssessmentIcon /> },
        { text: t("menu.clients"), path: "/customers", icon: <ShoppingCartIcon /> },
        { text: t("menu.forms"), path: "/forms", icon: <DescriptionIcon /> },
      ],
    },
  ];

  const enterpriseMenuItems: MenuItem[] = [
    {
      text: t("menu.enterprise"),
      icon: <BusinessIcon />,
      items: [
        {
          text: t("menu.departments"),
          path: "/enterprise/departments",
          icon: <BusinessIcon />,
        },
        { text: t("menu.positions"), path: "/enterprise/positions", icon: <WorkIcon /> },
        {
          text: t("menu.employees"),
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
            text: t("menu.settings"),
            icon: <SettingsIcon />,
            items: [
              {text: t("menu.general"), path: "/settings/general", icon: <SettingsIcon />},
              {text: t("menu.accountingPoints"), path: "/points", icon: <LocationOnIcon />},
            ],
          },
        ]
      : [
          {
            text: t("menu.settings"),
            icon: <SettingsIcon />,
            items: [
              {text: t("menu.general"), path: "/settings/general", icon: <SettingsIcon />},
              {text: t("menu.accountingPoints"), path: "/points", icon: <LocationOnIcon />},
              {text: t("menu.personGroups"), path: "/groups", icon: <GroupWorkIcon />},
              { text: t("menu.persons"), path: "/persons", icon: <PersonIcon /> },
              // { text: t("menu.users"), path: "/users", icon: <PeopleIcon /> },
            ],
          },
        ];

  const billingMenuItems: MenuItem[] = [
    { text: t("menu.billing"), path: "/billing", icon: <Payment />, },
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
    ...billingMenuItems,
    { text: t("menu.logout", { userName: user?.name }), path: "/logout", icon: <LogoutIcon /> },
  ];

  return currentMenuItems;
};