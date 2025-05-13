import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'; // Замінено на MenuIcon
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';

export interface MenuItem {
  text: string;
  path?: string;
  icon?: React.ReactElement;
  items?: MenuItem[];
  role?: string;
}

interface MainMenuProps {
  menuItems: MenuItem[];
  /** Заголовок, що відображається всередині відкритого меню */
  drawerTitle?: string;
}

const MainMenu: React.FC<MainMenuProps> = ({
 menuItems,
  drawerTitle = "Головне меню", // Значення за замовчуванням
}) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleExpandClick = (path: string) => {
    setExpanded({ ...expanded, [path]: !expanded[path] });
  };

  return (
    <>
      <Tooltip title="Головне меню">
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={handleToggle}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>
      <Drawer open={open} onClose={handleClose}>
        <Box p={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mb: 1 }}>
            <Tooltip title="Закрити меню">
              <IconButton
                onClick={handleClose}
                aria-label="close drawer"
                size="small"
                sx={{ mr: 1 }} // Додаємо відступ праворуч від кнопки
              >
                <MenuIcon /> {/* Іконка змінена тут */}
              </IconButton>
            </Tooltip>
            <Typography variant="h6">
              {drawerTitle}
            </Typography>
          </Box>
          <List>
            {menuItems.map((item) => (
              <React.Fragment key={item.path || item.text}> {/* Добавляем key сюда */}
                {item.items ? (
                  <> {/* Внутренний фрагмент не нуждается в key, т.к. он не прямой потомок map */}
                    <ListItem
                      key={item.path || item.text}
                      onClick={() => handleExpandClick(item.text)}
                      sx={{ cursor: 'pointer' }}
                    >
                      {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                      <ListItemText primary={item.text} />
                      {expanded[item.text] ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={expanded[item.text] || false} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.items.map((subItem) => (
                          <ListItem
                            key={subItem.path || subItem.text}
                            sx={{ pl: 4 }}
                            component={subItem.path ? Link : 'div'}
                            to={subItem.path}
                            onClick={handleClose}
                          >
                            {subItem.icon && <ListItemIcon>{subItem.icon}</ListItemIcon>}
                            <ListItemText primary={subItem.text} />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </>
                ) : (
                  <ListItem
                    key={item.path || item.text}
                    component={item.path ? Link : 'div'}
                    to={item.path}
                    onClick={handleClose}
                  >
                    {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                    <ListItemText primary={item.text} />
                  </ListItem>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default MainMenu;


/*
const menuItems: MenuItem[] = [
  {
    text: 'Главная',
    path: '/',
    icon: <HomeIcon />,
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
*/