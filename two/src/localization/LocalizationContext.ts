// src/localization/LocalizationContext.ts
import React, { createContext, useContext } from 'react';

// Тип для словарей (ключ: перевод)
export type Translations = Record<string, string>;

// Тип для всех словарей (язык: словарь)
export type Dictionaries = Record<string, Translations>;

// Тип для значений интерполяции
export type InterpolationValues = Record<string, string | number>;

// Интерфейс для значения контекста
export interface ILocalizationContext {
  language: string;
  setLanguage: (language: string) => void;
  translate: (key: string, values?: InterpolationValues) => string;
}

// Создаем контекст с начальными значениями по умолчанию
export const LocalizationContext = createContext<ILocalizationContext>({
  language: 'en', // Язык по умолчанию
  setLanguage: () => console.warn('LocalizationProvider not found'),
  translate: (key: string) => key, // По умолчанию возвращаем ключ
});

// Хук для удобного использования контекста
export const useLocalization = (): ILocalizationContext => useContext(LocalizationContext);
