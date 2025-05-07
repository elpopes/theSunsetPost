import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "./locales/en/translation.json";
import translationES from "./locales/es/translation.json";
import translationZH from "./locales/zh/translation.json";

const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
  zh: { translation: translationZH }, // generic Chinese
  "zh-CN": { translation: translationZH }, // Simplified Chinese fallback
  "zh-TW": { translation: translationZH }, // Traditional Chinese fallback (if needed)
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: {
    "zh-CN": ["zh"],
    "zh-TW": ["zh"],
    default: ["en"],
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
