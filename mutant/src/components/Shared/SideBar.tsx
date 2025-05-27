import React, { useState, useEffect, type JSX } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton, // Changed from ListItem for better click handling and selected state
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

// Определение типа MenuItem (аналогично MainMenu2)
// В идеале, этот тип должен быть вынесен в общий файл типов, например, src/types/navigation.ts
export interface MenuItem {
  text: string;
  path?: string;
  icon?: JSX.Element;
  items?: MenuItem[];
  role?: string; // Роль все еще может быть полезна для внутренней логики SideBar, если потребуется
  onClick?: () => void;
  external?: boolean; // Для внешних ссылок
}

interface SideBarProps {
  menuItems: MenuItem[];
  drawerTitle?: string;
  initialCollapsed?: boolean;
  expandMode?: 'overlay' | 'push';
  collapsedWidth?: number;
  expandedWidth?: number;
}

const DefaultCollapsedWidth = 60;
const DefaultExpandedWidth = 280;

const SideBar: React.FC<SideBarProps> = ({
  menuItems,
  drawerTitle = "Меню",
  initialCollapsed = true,
  expandMode = 'push',
  collapsedWidth = DefaultCollapsedWidth,
  expandedWidth = DefaultExpandedWidth,
}) => {
  const theme = useTheme();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  // Синхронизация состояния isCollapsed с initialCollapsed, если оно изменится извне (редко, но возможно)
  useEffect(() => {
    setIsCollapsed(initialCollapsed);
  }, [initialCollapsed]);

  // При изменении isCollapsed (особенно при сворачивании), закрываем все подменю
  useEffect(() => {
    if (isCollapsed) {
      setOpenSubMenus({});
    }
  }, [isCollapsed]);

  const handleDrawerToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSubMenuToggle = (text: string) => {
    if (!isCollapsed) { // Подменю можно открывать только в развернутом состоянии
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
            mr: sidebarIsCurrentlyCollapsed ? 0 : 1.5, // Отступ справа только если текст виден
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
            <Tooltip title={sidebarIsCurrentlyCollapsed ? item.text : ''} placement="right">
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

      // Элемент без подменю
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
        <Tooltip title={sidebarIsCurrentlyCollapsed ? item.text : ''} placement="right" key={itemKey}>
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
        {/* Кнопка для открытия Drawer, если он свернут. В App.tsx ее можно разместить в хедере. */}
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            display: isCollapsed ? 'inline-flex' : 'none', // Показываем, только если Drawer свернут
            position: 'fixed', // Пример позиционирования, лучше управлять из App.tsx
            top: theme.spacing(1),
            left: theme.spacing(1),
            zIndex: theme.zIndex.drawer + 1, // Выше Drawer, если он временный
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

  // expandMode === 'push'
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', p: 1, minHeight: 64 /* Примерная высота хедера */ }}>
        {!isCollapsed && <Typography variant="h6" noWrap sx={{ ml: 1 }}>{drawerTitle}</Typography>}
        <IconButton onClick={handleDrawerToggle}>
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      <List component="nav" sx={{ overflowY: 'auto', overflowX: 'hidden', flexGrow: 1, pt: 0 }}>
        {renderMenuItemsRecursive(menuItems, 0, isCollapsed)}
      </List>
    </Box>
  );
};

export default SideBar;