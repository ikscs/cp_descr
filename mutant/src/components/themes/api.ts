// api.ts
import axios from 'axios';
import { createTheme, Theme } from '@mui/material';
import { dbThemeSchema, DbThemeData } from '../themes/themeSchema copy2';
import { apiToken } from '../../api/data/fetchData';

const API_BASE_URL = 'https://cnt.theweb.place/api'; // Базовый URL вашего API

interface FetchThemesResult {
  themes: Record<string, Theme>;
  defaultThemeName: string;
  error: string | null;
}

export const fetchAndParseThemes = async (appId: string = 'mutant'): Promise<FetchThemesResult> => {
  let themes: Record<string, Theme> = {};
  let defaultThemeName: string = 'light'; // Или другое значение по умолчанию, если ничего не загрузится
  let error: string | null = null;

  if (!apiToken || !apiToken.token) {
    console.error('API token is not set. Please set the token before making requests.');
    // throw new Error('API token is not set');
    return { themes, defaultThemeName, error };
  }

  try {
    const res = await axios.get<DbThemeData[]>(`${API_BASE_URL}/theme/`, {
      params: { app_id: appId }
    });

    const validatedData = res.data.filter((item: any): item is DbThemeData => {
      const result = dbThemeSchema.safeParse(item);
      if (!result.success) {
        console.error(`[Theme API] Некорректная тема получена с сервера:`, result.error.errors, item);
      }
      return result.success;
    })
    .sort((a, b) => a.sortord - b.sortord )
    .filter((item) => item.enabled)
    ;

    if (validatedData.length === 0) {
      console.warn('[Theme API] Нет валидных тем, полученных с бэкенда. Использование темы по умолчанию.');
      // Создаем хотя бы одну базовую тему, если с бэкенда ничего не пришло
      themes['light'] = createTheme({ palette: { mode: 'light' } });
      defaultThemeName = 'light';
    } else {
      validatedData.forEach(dbTheme => {
        try {
          themes[dbTheme.name] = createTheme(dbTheme.value);
        } catch (themeError) {
          console.error(`[Theme API] Ошибка при создании темы "${dbTheme.name}":`, themeError);
        }
      });
      defaultThemeName = validatedData[0].name;
    }

  } catch (err: any) {
    console.error(`[Theme API] Ошибка при загрузке тем:`, err);
    error = err.message || 'Не удалось загрузить темы.';
    // В случае ошибки загружаем хотя бы базовые темы
    themes['light'] = createTheme({ palette: { mode: 'light' } });
    themes['dark'] = createTheme({ palette: { mode: 'dark' } });
    defaultThemeName = 'light';
  }

  return { themes, defaultThemeName, error };
};