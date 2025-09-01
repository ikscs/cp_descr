// src/components/Shared/grid/locales/index.ts
/*
import { ukUA } from '@mui/x-data-grid/locales';
import { enUS } from '@mui/x-data-grid/locales';
import { plPL } from '@mui/x-data-grid/locales';
import { deDE } from '@mui/x-data-grid/locales';

// Явно указываем тип для каждого объекта локали
const locales = {
  uk: ukUA,
  en: enUS,
  pl: plPL,
  de: deDE,
};

export type LocaleKey = keyof typeof locales;
export default locales; // Экспортируем как default, это упростит импорт
*/
// src/components/Shared/grid/locales/index.ts

// Импорт языковых пакетов для DataGrid
import {
  ukUA as DataGridUkUA,
  enUS as DataGridEnUS,
  plPL as DataGridPlPL,
  deDE as DataGridDeDE,
} from '@mui/x-data-grid/locales';

// Импорт языковых пакетов для LocalizationProvider
import {
  ukUA as LocalizationProviderUkUA,
  enUS as LocalizationProviderEnUS,
  plPL as LocalizationProviderPlPL,
  deDE as LocalizationProviderDeDE,
} from '@mui/x-date-pickers/locales';

// Создаем объект с локалями, разделяя их по компонентам
const locales = {
  uk: {
    dataGrid: DataGridUkUA,
    localizationProvider: LocalizationProviderUkUA,
  },
  en: {
    dataGrid: DataGridEnUS,
    localizationProvider: LocalizationProviderEnUS,
  },
  pl: {
    dataGrid: DataGridPlPL,
    localizationProvider: LocalizationProviderPlPL,
  },
  de: {
    dataGrid: DataGridDeDE,
    localizationProvider: LocalizationProviderDeDE,
  },
};

export type LocaleKey = keyof typeof locales;
export default locales;