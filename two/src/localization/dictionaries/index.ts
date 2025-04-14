// src/localization/dictionaries/index.ts
import { Dictionaries } from '../LocalizationContext';
import { enTranslations } from './en';
import { ruTranslations } from './ru';
import { ukTranslations } from './uk'; 

export const dictionaries: Dictionaries = {
  en: enTranslations,
  ru: ruTranslations,
  uk: ukTranslations,
};

export const supportedLanguages = Object.keys(dictionaries);
export const defaultLanguage = 'uk';
