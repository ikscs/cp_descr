// доработанный компонент сайдбара3 с кастомными цветами

import React, { useState, useEffect, type JSX } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Typography,
    Collapse,
    useTheme,
    IconButton,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useThemeSwitcher } from '../themes/DbThemeContext';

export interface MenuItem {
    text: string;
    path?: string;
    icon?: JSX.Element;
    items?: MenuItem[];
    role?: string;
    onClick?: () => void;
    external?: boolean;
}

interface SideBar3Props {
    menuItems: MenuItem[];
    drawerTitle?: string;
    initialCollapsed?: boolean;
    collapsedWidth?: number;
    expandedWidth?: number;
}

const DefaultCollapsedWidth = 60;
const DefaultExpandedWidth = 280;

const SideBar3: React.FC<SideBar3Props> = ({
    menuItems,
    drawerTitle = "Меню",
    initialCollapsed = true,
    collapsedWidth = DefaultCollapsedWidth,
    expandedWidth = DefaultExpandedWidth,
}) => {
    const theme = useTheme();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
    const { isLoadingThemes, themeError } = useThemeSwitcher();

    useEffect(() => {
        if (isCollapsed) {
            setOpenSubMenus({});
        }
    }, [isCollapsed]);

    const handleDrawerToggle = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleSubMenuToggle = (text: string) => {
        if (isCollapsed) {
            setIsCollapsed(false);
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
                        alignItems: 'center',
                        display: 'flex',
                        mr: sidebarIsCurrentlyCollapsed ? 0 : 1.5,
                        // Используем кастомные цвета для иконки
                        color: isSelected ? theme.palette.sidebar.selected.text : theme.palette.sidebar.items.text,
                    }}
                >
                    {item.icon}
                </ListItemIcon>
            ) : null;

            const commonListItemText = !sidebarIsCurrentlyCollapsed ? (
                <ListItemText
                    primary={item.text}
                    sx={{
                        // Используем кастомные цвета для текста
                        color: isSelected ? theme.palette.sidebar.selected.text : theme.palette.sidebar.items.text,
                    }}
                />
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
                                    alignItems: 'center',
                                    py: sidebarIsCurrentlyCollapsed ? 1.5 : 1,
                                    px: sidebarIsCurrentlyCollapsed ? 0 : undefined,
                                    // Используем кастомные цвета для фона и текста
                                    bgcolor: isSelected ? theme.palette.sidebar.selected.background : theme.palette.sidebar.items.background,
                                    '&:hover': {
                                        bgcolor: theme.palette.sidebar.hover.background,
                                    },
                                    color: isSelected ? theme.palette.sidebar.selected.text : theme.palette.sidebar.items.text,
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
                    alignItems: 'center',
                    py: sidebarIsCurrentlyCollapsed ? 1.5 : 1,
                    px: sidebarIsCurrentlyCollapsed ? 0 : undefined,
                    // Используем кастомные цвета для фона и текста
                    bgcolor: isSelected ? theme.palette.sidebar.selected.background : theme.palette.sidebar.items.background,
                    '&:hover': {
                        bgcolor: theme.palette.sidebar.hover.background,
                    },
                    color: isSelected ? theme.palette.sidebar.selected.text : theme.palette.sidebar.items.text,
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

    if (isLoadingThemes) {
        return <div>Загрузка тем...</div>;
    }
    
    if (themeError) {
        return <div>Ошибка загрузки темы: {themeError}</div>;
    }

    return (
        <Box
            component="nav"
            sx={{
                width: isCollapsed ? collapsedWidth : expandedWidth,
                flexShrink: 0,
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                overflowX: 'hidden',
                borderRight: 1,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                // Используем кастомные цвета для общего фона и текста сайдбара
                bgcolor: theme.palette.sidebar.background,
                color: theme.palette.sidebar.text,
                height: '100%'
            }}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                p: 1,
                minHeight: 64
            }}>
                {!isCollapsed && <Typography variant="h6" noWrap sx={{ ml: 1 }}>{drawerTitle}</Typography>}
                <IconButton
                    onClick={handleDrawerToggle}
                    // Используем кастомный цвет из темы для иконки
                    sx={{ color: theme.palette.sidebar.text }}
                >
                    {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </Box>
            <List component="nav" sx={{ overflowY: 'auto', flexGrow: 1 }}>
                {renderMenuItemsRecursive(menuItems, 0, isCollapsed)}
            </List>
        </Box>
    );
};

export default SideBar3;