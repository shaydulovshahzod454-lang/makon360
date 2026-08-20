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
    detection: {
      // Tanlangan tilni Local Storage'da saqlash, keyingi tashrifda eslab qolish uchun
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'makon360_language',
    },
    react: {
      // Tarjima hali yuklanayotganda ilova "to'xtab qolmasligi" (Suspense
      // xatosiga uchramasligi) uchun - o'rniga kalit nomi bir zumga
      // ko'rinib, millisekundlar ichida to'g'ri matnga almashadi
      useSuspense: false,
    },
  });

export default i18n;