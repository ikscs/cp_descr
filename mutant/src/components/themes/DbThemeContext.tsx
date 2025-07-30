// ThemeContext.tsx
import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, Theme, CssBaseline } from '@mui/material';
import { fetchAndParseThemes } from './api'; // Импортируем нашу утилиту

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
      setThemesMap(themes);
      setThemeError(error);

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
          setThemesMap({ 'light': createTheme({ palette: { mode: 'light' } }) });
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
    return themesMap[currentThemeName] || createTheme({ palette: { mode: 'light' } });
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