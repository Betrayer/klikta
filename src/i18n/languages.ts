export const SUPPORTED_LANGUAGES = ["en", "uk", "de", "fr", "es", "pl"] as const;

export type SupportedLang = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLang = "en";

export const LANGUAGE_LABELS: Record<SupportedLang, string> = {
  en: "English",
  uk: "Українська",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  pl: "Polski",
};

export const isSupportedLang = (value: unknown): value is SupportedLang =>
  typeof value === "string" &&
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
