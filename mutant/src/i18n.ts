// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend) // loads translations from your server (e.g. public/locales)
  .use(LanguageDetector) // detects user language
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: 'en', // fallback language if the detected language is not available
    debug: true, // set to false in production
    interpolation: {
      escapeValue: false, // react already escapes by default
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // path to your translation files
    },
    ns: ['translation'], // default namespace
    defaultNS: 'translation',
  });

export default i18n;