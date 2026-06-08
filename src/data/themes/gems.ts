import type { Theme } from "./types";
import { DEFAULT_HUD_SPEC } from "./defaults";
import { GEMS_SOUND_PACK_ID } from "../sound/gemsPack";

export const gemsTheme: Theme = {
  id: "gems",
  name: "Gems",
  ui: {
    primary: "#36d6a0",
    accent: "#7c5cff",
    highlight: "#4dd0e1",
    gold: "#ffd86b",
    info: "#5b8dff",
    danger: "#ff5a7a",
    background: "#0c1622",
    surface: "#122033",
    border: "#1f3047",
    text: "#e8f5ff",
  },
  targets: {
    regular: { mode: "sprite", texture: "gems-regular", color: 0x36d6a0 },
    golden: { mode: "sprite", texture: "gems-golden", color: 0xffd86b },
    bomb: { mode: "sprite", texture: "gems-bomb", color: 0xff5a7a },
    multi: {
      mode: "sprite",
      texture: "gems-multi-3",
      color: 0x7c5cff,
      states: {
        multi_3: "gems-multi-3",
        multi_2: "gems-multi-2",
        multi_1: "gems-multi-1",
      },
    },
    shielded: {
      mode: "sprite",
      texture: "gems-shield-up",
      color: 0x4dd0e1,
      states: {
        shield_up: "gems-shield-up",
        shield_down: "gems-shield-down",
      },
    },
    splitter: {
      mode: "sprite",
      texture: "gems-splitter",
      color: 0x5b8dff,
      fragmentTextures: ["gems-frag1", "gems-frag2", "gems-frag3"],
    },
    sticky: { mode: "sprite", texture: "gems-sticky", color: 0x36d6a0 },
  },
  particles: {
    golden: [0xffffff, 0xffd86b],
    bomb: [0xff5a7a, 0xff9ecb],
    milestone: [0x4dd0e1, 0xffffff],
  },
  background: {
    kind: "bokeh",
    color: 0x0c1622,
    bokehColor: 0x4dd0e1,
    bokehDensity: 6,
    animationSpeedSec: 8,
  },
  fonts: { display: "monospace", body: "system-ui, sans-serif" },
  defaultSoundPack: GEMS_SOUND_PACK_ID,
  hud: DEFAULT_HUD_SPEC,
  vfx: {
    hitParticleShape: "star",
    hitParticleScale: 1.1,
    goldenSparkle: "starburst",
    bombExplosion: "firework",
  },
};
