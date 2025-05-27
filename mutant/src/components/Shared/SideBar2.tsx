import React, { useState, useEffect, useRef, type JSX } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Collapse,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

// Ключі для localStorage
const LOCAL_STORAGE_KEY_COLLAPSED = 'sidebar2IsCollapsed';
const LOCAL_STORAGE_KEY_OPEN_SUBMENUS = 'sidebar2OpenSubMenus';

export interface MenuItem {
  text: string;
  path?: string;
  icon?: JSX.Element;
  items?: MenuItem[];
  role?: string;
  onClick?: () => void;
  external?: boolean;
}

interface SideBar2Props {
  menuItems: MenuItem[];
  drawerTitle?: string;
  initialCollapsed?: boolean;
  expandMode?: 'overlay' | 'push';
  collapsedWidth?: number;
  expandedWidth?: number;
}

const DefaultCollapsedWidth = 60;
const DefaultExpandedWidth = 280;

const SideBar2: React.FC<SideBar2Props> = ({
  menuItems,
  drawerTitle = "Меню",
  initialCollapsed = true,
  expandMode = 'push',
  collapsedWidth = DefaultCollapsedWidth,
  expandedWidth = DefaultExpandedWidth,
}) => {
  const theme = useTheme();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedIsCollapsed = localStorage.getItem(LOCAL_STORAGE_KEY_COLLAPSED);
      if (savedIsCollapsed !== null) {
        try {
          return JSON.parse(savedIsCollapsed) as boolean;
        } catch (e) {
          console.error(`Error parsing ${LOCAL_STORAGE_KEY_COLLAPSED} from localStorage:`, e);
        }
      }
    }
    return initialCollapsed;
  });

  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>(() => {
    let initialOpenSubMenus = {};
    if (typeof window !== 'undefined') {
      // Завжди завантажуємо збережений стан відкритих підменю,
      // незалежно від того, чи панель згорнута при ініціалізації.
      // Логіка відображення подбає про те, щоб не показувати їх, якщо панель згорнута.
      const savedOpenSubMenus = localStorage.getItem(LOCAL_STORAGE_KEY_OPEN_SUBMENUS);
      if (savedOpenSubMenus !== null) {
        try {
          const parsed = JSON.parse(savedOpenSubMenus);
          if (typeof parsed === 'object' && parsed !== null) {
            initialOpenSubMenus = parsed as Record<string, boolean>;
          }
        } catch (e) {
          console.error(`Error parsing ${LOCAL_STORAGE_KEY_OPEN_SUBMENUS} from localStorage:`, e);
        }
      }
    }
    return initialOpenSubMenus;
  });

  const [isHidingTooltipForCollapseAnimation, setIsHidingTooltipForCollapseAnimation] = useState(false);

  // Зберігаємо isCollapsed в localStorage при його зміні
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_COLLAPSED, JSON.stringify(isCollapsed)); // Зберігаємо стан isCollapsed
      } catch (e) {
        console.error(`Error saving ${LOCAL_STORAGE_KEY_COLLAPSED} to localStorage:`, e);
      }
    }
  }, [isCollapsed]);

  // Цей useEffect видалено, оскільки ми більше не хочемо скидати openSubMenus при згортанні.
  // Стан openSubMenus тепер зберігається незалежно.
  /*
  useEffect(() => {
    if (isCollapsed) {
      setOpenSubMenus({});
      // localStorage.setItem(LOCAL_STORAGE_KEY_OPEN_SUBMENUS, JSON.stringify({})); // Це також видалено
    }
  }, [isCollapsed]);
  */

  // Зберігаємо openSubMenus в localStorage при їх зміні (завжди)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_OPEN_SUBMENUS, JSON.stringify(openSubMenus));
      } catch (e) {
        console.error(`Error saving ${LOCAL_STORAGE_KEY_OPEN_SUBMENUS} to localStorage:`, e);
      }
    }
  }, [openSubMenus]); // Залежність тільки від openSubMenus

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleDrawerToggle = () => {
    if (!isCollapsed) { // Якщо панель розгорнута і зараз буде згортатися
      setIsHidingTooltipForCollapseAnimation(true);
      setTimeout(() => {
        if (mountedRef.current) { // Перевірка, чи компонент все ще змонтований
          setIsHidingTooltipForCollapseAnimation(false);
        }
      }, theme.transitions.duration.leavingScreen); // Тривалість анімації згортання
    }
    setIsCollapsed(!isCollapsed);
  };

  const handleSubMenuToggle = (text: string) => {
    if (isCollapsed) { // Якщо панель згорнута
      setIsCollapsed(false); // Розгортаємо панель
      // Відкриваємо підменю ПІСЛЯ того, як isCollapsed оновиться і useEffect для збереження спрацює
      // Це гарантує, що openSubMenus не буде збережено як порожній об'єкт
      setOpenSubMenus(prev => ({ ...prev, [text]: true }));
    } else {
      setOpenSubMenus(prev => ({ ...prev, [text]: !prev[text] }));
    }
  };

  const renderMenuItemsRecursive = (
    items: MenuItem[],
    currentLevel: number = 0,
    sidebarIsCurrentlyCollapsed: boolean
  ): JSX.Element[] => {
    return items.map((item) => {
      const hasSubItems = item.items && item.items.length > 0;
      const itemKey = `${item.text}-${item.path || ''}-${currentLevel}`;
      const isSelected = !hasSubItems && item.path === location.pathname;

      const commonListItemIcon = item.icon ? (
        <ListItemIcon
          sx={{
            minWidth: 0,
            justifyContent: 'center',
            mr: sidebarIsCurrentlyCollapsed ? 0 : 1.5,
            color: isSelected ? theme.palette.primary.main : 'inherit',
          }}
        >
          {item.icon}
        </ListItemIcon>
      ) : null;

      const commonListItemText = !sidebarIsCurrentlyCollapsed ? (
        <ListItemText primary={item.text} sx={{ opacity: sidebarIsCurrentlyCollapsed ? 0 : 1 }} />
      ) : null;

      if (hasSubItems) {
        return (
          <React.Fragment key={itemKey}>
            <Tooltip
              title={sidebarIsCurrentlyCollapsed ? item.text : ''}
              placement="right"
              disableHoverListener={!sidebarIsCurrentlyCollapsed || isHidingTooltipForCollapseAnimation}
              enterDelay={500} // Увеличиваем задержку появления тултипа
            >
              <ListItemButton
                onClick={() => handleSubMenuToggle(item.text)}
                sx={{
                  pl: sidebarIsCurrentlyCollapsed ? 0 : theme.spacing(2 + currentLevel * 2),
                  justifyContent: sidebarIsCurrentlyCollapsed ? 'center' : 'flex-start',
                  py: sidebarIsCurrentlyCollapsed ? 1.5 : 1,
                }}
              >
                {commonListItemIcon}
                {commonListItemText}
                {!sidebarIsCurrentlyCollapsed && (openSubMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </Tooltip>
            {!sidebarIsCurrentlyCollapsed && (
              <Collapse in={openSubMenus[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {renderMenuItemsRecursive(item.items!, currentLevel + 1, sidebarIsCurrentlyCollapsed)}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        );
      }

      const listItemProps: any = {
        selected: isSelected,
        sx: {
          pl: sidebarIsCurrentlyCollapsed ? 0 : theme.spacing(2 + currentLevel * 2),
          justifyContent: sidebarIsCurrentlyCollapsed ? 'center' : 'flex-start',
          py: sidebarIsCurrentlyCollapsed ? 1.5 : 1,
        },
      };
      if (item.path) {
        if (item.external) {
          listItemProps.component = 'a';
          listItemProps.href = item.path;
          listItemProps.target = '_blank';
          listItemProps.rel = 'noopener noreferrer';
        } else {
          listItemProps.component = RouterLink;
          listItemProps.to = item.path;
        }
      }
      if (item.onClick) {
        listItemProps.onClick = item.onClick;
      }

      return (
        <Tooltip
          title={sidebarIsCurrentlyCollapsed ? item.text : ''}
          placement="right"
          key={itemKey}
          enterDelay={500} // Увеличиваем задержку появления тултипа
          disableHoverListener={!sidebarIsCurrentlyCollapsed || isHidingTooltipForCollapseAnimation}
        >
          <ListItemButton {...listItemProps}>
            {commonListItemIcon}
            {commonListItemText}
          </ListItemButton>
        </Tooltip>
      );
    });
  };

  if (expandMode === 'overlay') {
    return (
      <>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            display: isCollapsed ? 'inline-flex' : 'none',
            position: 'fixed',
            top: theme.spacing(1),
            left: theme.spacing(1),
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          variant="temporary"
          open={!isCollapsed}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: expandedWidth, boxSizing: 'border-box' } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, ...theme.mixins.toolbar }}>
            <Typography variant="h6" sx={{ ml: 1 }}>{drawerTitle}</Typography>
            <IconButton onClick={handleDrawerToggle}><ChevronLeftIcon /></IconButton>
          </Box>
          <List component="nav">{renderMenuItemsRecursive(menuItems, 0, false)}</List>
        </Drawer>
      </>
    );
  }

  return (
    <Box
      component="nav"
      sx={{
        width: isCollapsed ? collapsedWidth : expandedWidth,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: isCollapsed ? theme.transitions.duration.leavingScreen : theme.transitions.duration.enteringScreen,
        }),
        overflowX: 'hidden',
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', p: 1, minHeight: 64 }}>
        {!isCollapsed && <Typography variant="h6" noWrap sx={{ ml: 1 }}>{drawerTitle}</Typography>}
        <Tooltip
          title={isCollapsed ? "Розгорнути меню" : "Згорнути меню"}
          placement="right"
          enterDelay={500} // Увеличиваем задержку появления тултипа
          key={isHidingTooltipForCollapseAnimation ? 'tooltip-hiding' : 'tooltip-normal'}
          open={isHidingTooltipForCollapseAnimation ? false : undefined}
          componentsProps={{
            tooltip: {
              sx: {
                fontSize: '0.875rem',
              },
            },
          }}
        >
          <IconButton onClick={handleDrawerToggle}>
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <List component="nav" sx={{ overflowY: 'auto', overflowX: 'hidden', flexGrow: 1, pt: 0 }}>
        {renderMenuItemsRecursive(menuItems, 0, isCollapsed)}
      </List>
    </Box>
  );
};

export default SideBar2;
