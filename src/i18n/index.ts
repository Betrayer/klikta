import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { loadLanguageBundles } from "./resources";
import { SUPPORTED_LANGUAGES, type SupportedLang } from "./languages";

export const I18N_NAMESPACES = [
  "common",
  "menu",
  "game",
  "summary",
  "leaderboard",
  "settings",
  "auth",
  "perks",
  "modes",
  "runPerks",
  "cosmetics",
] as const;

export const applyLanguageBundles = async (
  lang: SupportedLang,
): Promise<void> => {
  const bundles = await loadLanguageBundles(lang);
  for (const { namespace, resource } of bundles) {
    i18n.addResourceBundle(lang, namespace, resource, true, true);
  }
};

export const initI18n = async (lng: SupportedLang): Promise<void> => {
  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: "en",
    supportedLngs: [...SUPPORTED_LANGUAGES],
    ns: [...I18N_NAMESPACES],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    returnNull: false,
    resources: {},
  });
  if (lng !== "en") await applyLanguageBundles("en");
  await applyLanguageBundles(lng);
};

export default i18n;
