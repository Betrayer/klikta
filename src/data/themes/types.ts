import type { TargetKind } from "../targetConfig";

export type SfxName =
  | "hit_regular"
  | "hit_golden"
  | "hit_multi_partial"
  | "hit_multi_complete"
  | "hit_shielded_break"
  | "bomb_click"
  | "miss"
  | "combo_milestone"
  | "game_over";

export type TargetRenderMode = "vector" | "sprite";

export type TargetShape =
  | "circle"
  | "star"
  | "flower"
  | "roundedSquare"
  | "hexagon";

export interface TargetVisual {
  mode: TargetRenderMode;
  shape?: TargetShape;
  color?: number;
  texture?: string;
  tint?: number;
}

export type BackgroundKind = "solid" | "gradient" | "image";

export interface BackgroundSpec {
  kind: BackgroundKind;
  color?: number;
  gradientFrom?: number;
  gradientTo?: number;
  texture?: string;
}

export interface ParticlePalettes {
  golden: number[];
  bomb: number[];
  milestone: number[];
}

export interface ThemeUiColors {
  primary: string;
  accent: string;
  highlight: string;
  gold: string;
  info: string;
  danger: string;
  background: string;
  surface: string;
  border: string;
  text: string;
}

export interface ThemeFonts {
  display: string;
  body: string;
}

export interface Theme {
  id: string;
  name: string;
  ui: ThemeUiColors;
  targets: Record<TargetKind, TargetVisual>;
  particles: ParticlePalettes;
  background: BackgroundSpec;
  fonts: ThemeFonts;
  defaultSoundPack: string;
}

export interface SoundPackMusic {
  src: string;
}

export interface SoundPack {
  id: string;
  name: string;
  music: SoundPackMusic;
  sfx: Record<SfxName, string[]>;
}
