import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
  .use(LanguageDetector)
  .use(resourcesToBackend((language) => import(`./locales/${language}.json`)))
  .use(initReactI18next)
  .init({
    fallbackLng: 'uz',
    supportedLngs: ['uz', 'en', 'ru'],
    interpolation: {
      escapeValue: false, // React allaqachon XSS'dan himoyalaydi
    },
    react: {
      // MUHIM: Suspense yoqilgan bo'lsa, React butun sahifani tarjima
      // fayllari (en.json/uz.json) TO'LIQ yuklanguncha umuman chizmaydi -
      // bu LCP'ni sun'iy ravishda kechiktiradi. useSuspense: false bilan,
      // sahifa darhol chiziladi, tarjimalar orqadan "peshgacha" tortiladi.
      useSuspense: false,
    },
    detection: {
      // Tanlangan tilni Local Storage'da saqlash, keyingi tashrifda eslab qolish uchun
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'makon360_language',
    },
  });

export default i18n;