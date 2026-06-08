import type { Theme } from "./types";
import { synthwaveTheme } from "./synthwave";
import { daybreakTheme } from "./daybreak";
import { slateTheme } from "./slate";
import { gemsTheme } from "./gems";

export const DEFAULT_THEME: Theme = synthwaveTheme;
export const DEFAULT_THEME_ID = synthwaveTheme.id;

export const THEMES: Record<string, Theme> = {
  [synthwaveTheme.id]: synthwaveTheme,
  [daybreakTheme.id]: daybreakTheme,
  [slateTheme.id]: slateTheme,
  [gemsTheme.id]: gemsTheme,
};
