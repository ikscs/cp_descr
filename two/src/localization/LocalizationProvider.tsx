// src/localization/LocalizationProvider.tsx
import React, { useState, useCallback, useMemo, ReactNode } from 'react';
import { LocalizationContext, ILocalizationContext, InterpolationValues } from './LocalizationContext';
import { dictionaries, defaultLanguage } from './dictionaries';

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(defaultLanguage);

  const setLanguage = useCallback((lang: string) => {
    // Проверяем, поддерживается ли язык, иначе оставляем текущий
    if (dictionaries[lang]) {
      setLanguageState(lang);
    } else {
      console.warn(`Language "${lang}" is not supported.`);
    }
  }, []);

  const translate = useCallback((key: string, values?: InterpolationValues): string => {
    const currentDictionary = dictionaries[language] || dictionaries[defaultLanguage];
    let translation = currentDictionary[key] || key; // Возвращаем ключ, если перевод не найден

    // Простая интерполяция: заменяем {placeholder} на значение
    if (values) {
      Object.entries(values).forEach(([placeholder, value]) => {
        const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
        translation = translation.replace(regex, String(value));
      });
    }

    return translation;
  }, [language]); // Зависит только от языка

  // Мемоизируем значение контекста, чтобы избежать лишних ререндеров у потребителей
  const contextValue = useMemo<ILocalizationContext>(() => ({
    language,
    setLanguage,
    translate,
  }), [language, setLanguage, translate]);

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};
