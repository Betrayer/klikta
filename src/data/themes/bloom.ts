import type { Theme } from "./types";
import { DEFAULT_SOUND_PACK_ID } from "../sound";

export const bloomTheme: Theme = {
  id: "bloom",
  name: "Bloom",
  ui: {
    primary: "#ff5d8f",
    accent: "#9d7bff",
    highlight: "#ff9ecb",
    gold: "#ffd86b",
    info: "#7fb8ff",
    danger: "#ff5a7a",
    background: "#2a0f1f",
    surface: "#3a1730",
    border: "#5a2745",
    text: "#ffe9f2",
  },
  targets: {
    regular: { mode: "sprite", texture: "bloom-regular", color: 0xff8fb8 },
    golden: { mode: "sprite", texture: "bloom-golden", color: 0xffd35e },
    bomb: { mode: "sprite", texture: "bloom-bomb", color: 0x9a3a5a },
    multi: {
      mode: "sprite",
      texture: "bloom-multi-3",
      color: 0xb388ff,
      states: {
        multi_3: "bloom-multi-3",
        multi_2: "bloom-multi-2",
        multi_1: "bloom-multi-1",
      },
    },
    shielded: {
      mode: "sprite",
      texture: "bloom-shield-up",
      color: 0x57c9bd,
      states: {
        shield_up: "bloom-shield-up",
        shield_down: "bloom-shield-down",
      },
    },
    splitter: { mode: "sprite", texture: "bloom-splitter", color: 0xff9a52 },
    sticky: { mode: "sprite", texture: "bloom-sticky", color: 0x6fd9cc },
  },
  particles: {
    golden: [0xffffff, 0xffd86b],
    bomb: [0xc94f7c, 0xff9ecb],
    milestone: [0xffc2e0, 0xffffff],
  },
  background: {
    kind: "bokeh",
    color: 0x2a0f1f,
    bokehColor: 0xffd0e0,
    bokehDensity: 6,
    animationSpeedSec: 8,
  },
  fonts: {
    display: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',
    body: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',
  },
  defaultSoundPack: DEFAULT_SOUND_PACK_ID,
  hud: {
    style: "ringed",
    surface: "rgba(40, 12, 28, 0.42)",
    score: { frame: "pill", accent: "primary", position: "top-left" },
    wave: { accent: "info", position: "top-center" },
    hp: { type: "hearts", accent: "highlight", position: "around-screen" },
    combo: { accent: "highlight", position: "top-center", bumpScale: 1.3 },
    timer: { accent: "highlight", lowAccent: "danger", position: "top-right" },
    ultimate: { position: "bottom-center", surface: "rgba(40, 12, 28, 0.55)" },
  },
  vfx: {
    hitParticleShape: "petal",
    hitParticleScale: 1.2,
    goldenSparkle: "pollen",
    bombExplosion: "wilt",
  },
};
