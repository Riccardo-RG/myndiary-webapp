import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Le risorse linguistiche
const resources = {
  en: {
    translation: require("./locales/en/translation.json"),
  },
  it: {
    translation: require("./locales/it/translation.json"),
  },
  es: {
    translation: require("./locales/es/translation.json"),
  },
  fr: {
    translation: require("./locales/fr/translation.json"),
  },
};

i18n
  // Rileva la lingua del browser
  .use(LanguageDetector)
  // Passa l'i18n a react-i18next
  .use(initReactI18next)
  // Inizializza i18next
  .init({
    resources,
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    interpolation: {
      escapeValue: false, // React si occupa già dell'escape
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
