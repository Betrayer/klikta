import type { Theme } from "./types";
import { synthwaveTheme } from "./synthwave";

export const DEFAULT_THEME: Theme = synthwaveTheme;
export const DEFAULT_THEME_ID = synthwaveTheme.id;

export const THEMES: Record<string, Theme> = {
  [synthwaveTheme.id]: synthwaveTheme,
};
