import { useMetaStore } from "./metaStore";
import { DEFAULT_THEME, THEMES } from "../data/themes";
import { DEFAULT_SOUND_PACK, SOUND_PACKS } from "../data/sound";
import type { SoundPack, Theme } from "../data/themes/types";

export const getActiveTheme = (): Theme =>
  THEMES[useMetaStore.getState().activeThemeId] ?? DEFAULT_THEME;

export const getActiveMusicPack = (): SoundPack =>
  SOUND_PACKS[useMetaStore.getState().activeMusicPackId] ?? DEFAULT_SOUND_PACK;

export const getActiveSfxPack = (): SoundPack =>
  SOUND_PACKS[useMetaStore.getState().activeSfxPackId] ?? DEFAULT_SOUND_PACK;
