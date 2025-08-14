// Временное решение для использования кастомных стилей в сайдбаре
// В будущем будем держать в хранимых темах, тогда wrapper не понадобится

import React, { type JSX } from 'react';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import SideBar3, { type MenuItem } from './SideBar5';

// Определение кастомных стилей для сайдбара
const sidebarCustomStyles = {
    palette: {
        sidebar: {
            background: '#1D2A38',
            text: '#A6B1C2',
            item: {
                background: 'transparent',
                text: '#A6B1C2',
            },
            selected: {
                background: '#2C3E50',
                text: '#ffffff',
            },
            hover: {
                background: '#2C3E50',
            },
        },
    },
};

interface SideBarWrapperProps {
  menuItems: MenuItem[];
  drawerTitle?: string;
  initialCollapsed?: boolean;
  collapsedWidth?: number;
  expandedWidth?: number;
}

const SideBarWrapper: React.FC<SideBarWrapperProps> = ({
  menuItems,
  ...otherProps
}) => {
  const mainTheme = useTheme();

  // Создаем объединенную тему, которая включает глобальную тему и кастомные стили
//   const sidebarTheme = createTheme(mainTheme, sidebarCustomStyles);

// Объединяем основную тему с кастомными стилями для сайдбара с помощью deepmerge
    // const combinedPalette = deepmerge(mainTheme.palette, sidebarCustomStyles.palette);

    // const sidebarTheme = createTheme({
    // ...mainTheme,
    // palette: combinedPalette,
    // });
    const sidebarTheme = createTheme(mainTheme, sidebarCustomStyles)

    return (
        <ThemeProvider theme={sidebarTheme}>
            <SideBar3 menuItems={menuItems} {...otherProps} />
        </ThemeProvider>
    );
};

export default SideBarWrapper;