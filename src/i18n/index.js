import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import cs from "../locales/cs/translation.json";
import en from "../locales/en/translation.json";
import de from "../locales/de/translation.json";
import fr from "../locales/fr/translation.json";

const resources = {
  cs: { translation: cs },
  en: { translation: en },
  de: { translation: de },
  fr: { translation: fr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "cs",
    supportedLngs: ["cs", "en", "de", "fr"],
    load: "languageOnly",
    detection: {
      order: ["localStorage", "htmlTag"],
      lookupLocalStorage: "ppv_lang",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (language) => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.resolvedLanguage || "cs";
}

export default i18n;
