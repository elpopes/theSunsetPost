import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "./locales/en/translation.json";
import translationES from "./locales/es/translation.json";
import translationZH from "./locales/zh/translation.json";
import authorEN from "./locales/en/author.json";
import authorES from "./locales/es/author.json";
import authorZH from "./locales/zh/author.json";

const routeLanguage = (() => {
  if (typeof window === "undefined") return "en";

  const match = window.location.pathname.match(/^\/(en|es|zh)(?:\/|$)/);
  return match?.[1] || "en";
})();

const resources = {
  en: { translation: { ...translationEN, ...authorEN } },
  es: { translation: { ...translationES, ...authorES } },
  zh: { translation: { ...translationZH, ...authorZH } }, // generic Chinese
  "zh-CN": { translation: { ...translationZH, ...authorZH } }, // Simplified Chinese fallback
  "zh-TW": { translation: { ...translationZH, ...authorZH } }, // Traditional Chinese fallback (if needed)
};

i18n.use(initReactI18next).init({
  resources,
  lng: routeLanguage,
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
