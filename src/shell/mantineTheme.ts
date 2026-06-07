import {
  createTheme,
  colorsTuple,
  type MantineThemeOverride,
} from "@mantine/core";
import { useMemo } from "react";
import { useMetaStore } from "../state/metaStore";
import { useSettingsStore } from "../state/settingsStore";
import { DEFAULT_THEME, THEMES } from "../data/themes";
import type { Theme } from "../data/themes/types";
import { isTouchDevice } from "../game/util/device";
import { getTelegramAccentColor } from "../services/telegram";

export const TELEGRAM_BRAND = "#229ed9";

const touchComponents: MantineThemeOverride["components"] = {
  Button: { defaultProps: { size: "md" } },
};

export const buildMantineTheme = (
  theme: Theme,
  accentOverride?: string,
): MantineThemeOverride =>
  createTheme({
    primaryColor: "primary",
    fontFamily: theme.fonts.body,
    fontFamilyMonospace: theme.fonts.display,
    ...(isTouchDevice() ? { components: touchComponents } : {}),
    colors: {
      primary: colorsTuple(accentOverride ?? theme.ui.primary),
      accent: colorsTuple(theme.ui.accent),
      highlight: colorsTuple(theme.ui.highlight),
      gold: colorsTuple(theme.ui.gold),
      info: colorsTuple(theme.ui.info),
      danger: colorsTuple(theme.ui.danger),
      background: colorsTuple(theme.ui.background),
      surface: colorsTuple(theme.ui.surface),
      border: colorsTuple(theme.ui.border),
      text: colorsTuple(theme.ui.text),
      telegram: colorsTuple(TELEGRAM_BRAND),
    },
  });

export const useActiveMantineTheme = (): MantineThemeOverride => {
  const themeId = useMetaStore((s) => s.activeThemeId);
  const useTelegramTheme = useSettingsStore((s) => s.useTelegramTheme);
  return useMemo(() => {
    const base = THEMES[themeId] ?? DEFAULT_THEME;
    const override = useTelegramTheme ? getTelegramAccentColor() : undefined;
    return buildMantineTheme(base, override);
  }, [themeId, useTelegramTheme]);
};
