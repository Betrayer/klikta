import type { TargetKind } from "../targetConfig";

export type SfxName =
  | "hit_regular"
  | "hit_golden"
  | "hit_multi_partial"
  | "hit_multi_complete"
  | "hit_shielded_break"
  | "hit_shielded"
  | "hit_splitter"
  | "hit_splitter_frag"
  | "sticky"
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

export interface TargetStateTextures {
  shield_up?: string;
  shield_down?: string;
  multi_3?: string;
  multi_2?: string;
  multi_1?: string;
}

export interface TargetVisual {
  mode: TargetRenderMode;
  shape?: TargetShape;
  color?: number;
  texture?: string;
  tint?: number;
  states?: TargetStateTextures;
  fragmentTextures?: string[];
}

export type BackgroundKind =
  | "solid"
  | "gradient"
  | "image"
  | "tiled"
  | "animated_gradient"
  | "bokeh"
  | "noise"
  | "custom";

export interface BackgroundSpec {
  kind: BackgroundKind;
  color?: number;
  gradientFrom?: number;
  gradientTo?: number;
  texture?: string;
  tileScale?: number;
  animationSpeedSec?: number;
  colorStops?: number[];
  bokehColor?: number;
  bokehDensity?: number;
  customRenderer?: string;
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

export type ThemeColorKey = keyof ThemeUiColors;

export type HudStyle = "framed" | "minimal" | "ringed";

export type HudPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-center"
  | "around-screen";

export type ScoreFrameStyle = "rounded" | "sharp" | "pill" | "none";

export type HpVisualType = "bar" | "hearts" | "ring" | "pips";

export interface ScoreVisualSpec {
  frame: ScoreFrameStyle;
  accent: ThemeColorKey;
  position: HudPosition;
}

export interface WaveVisualSpec {
  accent: ThemeColorKey;
  position: HudPosition;
}

export interface HpVisualSpec {
  type: HpVisualType;
  accent: ThemeColorKey;
  position: HudPosition;
}

export interface ComboVisualSpec {
  accent: ThemeColorKey;
  position: HudPosition;
  bumpScale: number;
}

export interface TimerVisualSpec {
  accent: ThemeColorKey;
  lowAccent: ThemeColorKey;
  position: HudPosition;
}

export interface UltVisualSpec {
  position: HudPosition;
  surface: string;
}

export interface HudSpec {
  style: HudStyle;
  surface: string;
  score: ScoreVisualSpec;
  wave: WaveVisualSpec;
  hp: HpVisualSpec;
  combo: ComboVisualSpec;
  timer: TimerVisualSpec;
  ultimate: UltVisualSpec;
  customComponent?: string;
}

export type HitParticleShape = "circle" | "star" | "petal" | "square";

export type GoldenSparkleStyle = "standard" | "starburst" | "pollen";

export type BombExplosionStyle = "standard" | "firework" | "wilt";

export interface VfxStyleSpec {
  hitParticleShape?: HitParticleShape;
  hitParticleScale?: number;
  goldenSparkle?: GoldenSparkleStyle;
  bombExplosion?: BombExplosionStyle;
}

export interface CursorSpec {
  default?: string;
  hover?: string;
  click?: string;
}

export type ScreenTransition = "fade" | "slide" | "wipe" | "none";

export interface TransitionsSpec {
  screenChange?: ScreenTransition;
  durationMs?: number;
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
  hud: HudSpec;
  vfx?: VfxStyleSpec;
  cursor?: CursorSpec;
  transitions?: TransitionsSpec;
}

export interface SoundPackMusic {
  src: string;
}

export interface SoundPack {
  id: string;
  name: string;
  music: SoundPackMusic;
  sfx: Record<SfxName, string[][]>;
  gain?: number;
  rate?: number;
}
