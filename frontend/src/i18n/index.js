import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import uz from './locales/uz.json';
import en from './locales/en.json';
import ru from './locales/ru.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      en: { translation: en },
      ru: { translation: ru },
    },
    fallbackLng: 'uz',
    supportedLngs: ['uz', 'en', 'ru'],
    interpolation: {
      escapeValue: false, // React allaqachon XSS'dan himoyalaydi
    },
    detection: {
      // Tanlangan tilni Local Storage'da saqlash, keyingi tashrifda eslab qolish uchun
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'makon360_language',
    },
  });

export default i18n;