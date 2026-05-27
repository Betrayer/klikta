import {
  createTheme,
  colorsTuple,
  type MantineThemeOverride,
} from "@mantine/core";
import { useMemo } from "react";
import { useMetaStore } from "../state/metaStore";
import { DEFAULT_THEME, THEMES } from "../data/themes";
import type { Theme } from "../data/themes/types";

export const TELEGRAM_BRAND = "#229ed9";

export const buildMantineTheme = (theme: Theme): MantineThemeOverride =>
  createTheme({
    primaryColor: "primary",
    fontFamily: theme.fonts.body,
    fontFamilyMonospace: theme.fonts.display,
    colors: {
      primary: colorsTuple(theme.ui.primary),
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
  return useMemo(
    () => buildMantineTheme(THEMES[themeId] ?? DEFAULT_THEME),
    [themeId],
  );
};
