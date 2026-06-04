import type { Theme } from "./types";
import { synthwaveTheme } from "./synthwave";
import { auroraTheme } from "./aurora";
import { bloomTheme } from "./bloom";

export const DEFAULT_THEME: Theme = synthwaveTheme;
export const DEFAULT_THEME_ID = synthwaveTheme.id;

export const THEMES: Record<string, Theme> = {
  [synthwaveTheme.id]: synthwaveTheme,
  [auroraTheme.id]: auroraTheme,
  [bloomTheme.id]: bloomTheme,
};
