import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ur from './locales/ur.json';
import ps from './locales/ps.json';
import ar from './locales/ar.json';
import it from './locales/it.json';

const resources = {
  en: { translation: en },
  ur: { translation: ur },
  ps: { translation: ps },
  ar: { translation: ar },
  it: { translation: it },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ur', 'ps', 'ar', 'it'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'appLanguage',
    },
  });

export default i18n;
