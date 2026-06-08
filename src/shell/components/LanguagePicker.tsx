import { Select } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "../../state/settingsStore";
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  isSupportedLang,
} from "../../i18n/languages";

export const LanguagePicker = () => {
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const data = SUPPORTED_LANGUAGES.map((code) => ({
    value: code,
    label: LANGUAGE_LABELS[code],
  }));
  return (
    <Select
      label={t("settings:language")}
      data={data}
      value={language}
      allowDeselect={false}
      onChange={(value) => {
        if (isSupportedLang(value)) setLanguage(value);
      }}
    />
  );
};
