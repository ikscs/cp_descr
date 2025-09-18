// ThemeContext.tsx
import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, Theme, CssBaseline } from '@mui/material';
import { fetchAndParseThemes } from './api'; // Импортируем нашу утилиту
import { defaultSidebarPalette, normalizeTheme } from '../../utils/normalizeTheme';

// const defaultSidebarPalette = {
//     background: '#ffffff', // или любой другой безопасный дефолт
//     text: '#000000',
//     items: {
//         background: 'transparent',
//         text: '#000000',
//     },
//     selected: {
//         background: '#e0e0e0',
//         text: '#000000',
//     },
//     hover: {
//         background: '#f5f5f5',
//     },
// };

// Определите типы для контекста темы
interface DbThemeContextType {
  currentThemeName: string;
  setThemeName: (themeName: string) => void;
  availableThemes: string[];
  isLoadingThemes: boolean;
  themeError: string | null;
}

// Создайте контекст
const ThemeContext = createContext<DbThemeContextType | undefined>(undefined);

interface DbThemeProviderProps {
  children: ReactNode;
  appId?: string; // Пропс для app_id, если он нужен для API
}

export const DbThemeProvider: React.FC<DbThemeProviderProps> = ({ children, appId = 'mutant' }) => {
  const [themesMap, setThemesMap] = useState<Record<string, Theme>>({});
  const [currentThemeName, setCurrentThemeName] = useState<string>('light'); // Начальная тема по умолчанию
  const [isLoadingThemes, setIsLoadingThemes] = useState<boolean>(true);
  const [themeError, setThemeError] = useState<string | null>(null);

  useEffect(() => {
    const loadThemes = async () => {
      setIsLoadingThemes(true);
      const { themes, defaultThemeName, error } = await fetchAndParseThemes(appId);

      // 2025-09-02
      const normalizedThemes: Record<string, Theme> = {};
      for (const [name, rawTheme] of Object.entries(themes)) {
        normalizedThemes[name] = normalizeTheme(rawTheme);

        // customize button
/**/        
        normalizedThemes[name].components = {...normalizedThemes[name].components,
          MuiButton: {
            defaultProps: {
              disableRipple: true,
              disableFocusRipple: true,
            },
            styleOverrides: {
              root: {
                '&.Mui-focusVisible': {
                  boxShadow: 'none',
                  outline: '1px solid black',
                  outlineOffset: '2px',
                  backgroundColor: 'transparent',
                },
                '&:focus': {
                  boxShadow: 'none',
                  outline: '1px solid black',
                  outlineOffset: '2px',
                },
                '&:hover': {
                  outline: '1px solid',
                  outlineOffset: '2px',
                },
              },
            },
          },
        }
/**/

      }
      setThemesMap(normalizedThemes);

      // setThemesMap(themes);
      // setThemeError(error);

      // Устанавливаем тему из localStorage или тему по умолчанию, если она доступна
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme && themes[storedTheme]) {
        setCurrentThemeName(storedTheme);
      } else if (themes[defaultThemeName]) {
        setCurrentThemeName(defaultThemeName);
      } else {
        // Если тема по умолчанию не найдена (чего быть не должно, если fetchAndParseThemes отработал корректно),
        // используем первую доступную тему
        const firstAvailableTheme = Object.keys(themes)[0];
        if (firstAvailableTheme) {
          setCurrentThemeName(firstAvailableTheme);
        } else {
          // Крайний случай: нет тем, даже по умолчанию
          setCurrentThemeName('light'); // Fallback на совсем дефолтную
          setThemesMap({ 'light': createTheme({ palette: { mode: 'light', sidebar: defaultSidebarPalette } }) });
        }
      }
      setIsLoadingThemes(false);
    };

    loadThemes();
  }, [appId]); // Перезагружаем темы, если appId меняется

  const setThemeName = useCallback((themeName: string) => {
    if (themesMap[themeName]) {
      setCurrentThemeName(themeName);
      localStorage.setItem('theme', themeName); // Сохраняем тему в localStorage
    } else {
      console.warn(`[ThemeContext] Тема "${themeName}" недоступна.`);
    }
  }, [themesMap]);

  const currentMuiTheme = useMemo(() => {
    // Если темы еще не загружены или текущая тема не найдена, используем временную заглушку
    // return themesMap[currentThemeName] || createTheme({ palette: { mode: 'light' } });
    // Эта заглушка будет использоваться, пока темы не загрузятся
    const baseTheme = createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: '#1976d2',
        },
        secondary: {
          main: '#9c27b0',
        },
      },
    });
    const defaultThemeWithCustoms = createTheme(baseTheme, {
        palette: {
            sidebar: defaultSidebarPalette
        }
    });
    // const defaultThemeWithCustoms = createTheme({
    //     palette: {
    //         mode: 'light',
    //         sidebar: defaultSidebarPalette
    //     }
    // });

    const themeToReturn = themesMap[currentThemeName] || defaultThemeWithCustoms;
    
    // Добавьте это, чтобы увидеть, что именно получает провайдер
    console.log('Тема, передаваемая в MuiThemeProvider:', themeToReturn);
    console.log('Существует ли themeToReturn.palette.sidebar?', !!themeToReturn.palette.sidebar);

    return themeToReturn;

    // return themesMap[currentThemeName] || defaultThemeWithCustoms;
  }, [currentThemeName, themesMap]);

  const availableThemes = useMemo(() => Object.keys(themesMap), [themesMap]);

  const contextValue = useMemo(() => ({
    currentThemeName,
    setThemeName,
    availableThemes,
    isLoadingThemes,
    themeError,
  }), [currentThemeName, setThemeName, availableThemes, isLoadingThemes, themeError]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={currentMuiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeSwitcher = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeSwitcher must be used within a ThemeProvider');
  }
  return context;
};