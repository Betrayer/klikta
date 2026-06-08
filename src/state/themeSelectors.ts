import { useMetaStore } from "./metaStore";
import { DEFAULT_THEME, THEMES } from "../data/themes";
import { DEFAULT_SOUND_PACK, SOUND_PACKS } from "../data/sound";
import { DEFAULT_VFX_STYLE } from "../data/themes/defaults";
import type {
  BackgroundSpec,
  CursorSpec,
  HudSpec,
  SoundPack,
  TargetVisual,
  Theme,
  TransitionsSpec,
  VfxStyleSpec,
} from "../data/themes/types";
import type { TargetKind } from "../data/targetConfig";

export const getActiveTheme = (): Theme =>
  THEMES[useMetaStore.getState().activeThemeId] ?? DEFAULT_THEME;

export const getActiveMusicPack = (): SoundPack =>
  SOUND_PACKS[useMetaStore.getState().activeMusicPackId] ?? DEFAULT_SOUND_PACK;

export const getActiveSfxPack = (): SoundPack =>
  SOUND_PACKS[useMetaStore.getState().activeSfxPackId] ?? DEFAULT_SOUND_PACK;

export const getHudSpec = (): HudSpec => ({
  ...getActiveTheme().hud,
  style: useMetaStore.getState().activeHudStyle,
});

export const getBackgroundSpec = (): BackgroundSpec =>
  getActiveTheme().background;

export const getVfxStyle = (): Required<VfxStyleSpec> => ({
  ...DEFAULT_VFX_STYLE,
  ...getActiveTheme().vfx,
});

export const getCursorSpec = (): CursorSpec | undefined =>
  getActiveTheme().cursor;

export const getTransitions = (): TransitionsSpec | undefined =>
  getActiveTheme().transitions;

export const getTargetStateTextures = (
  kind: TargetKind,
): TargetVisual["states"] | undefined => getActiveTheme().targets[kind].states;
