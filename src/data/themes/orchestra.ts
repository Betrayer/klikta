import type { Theme } from "./types";
import { DEFAULT_HUD_SPEC } from "./defaults";
import { ORCHESTRA_SOUND_PACK_ID } from "../sound/orchestraPack";

export const orchestraTheme: Theme = {
  id: "orchestra",
  name: "Orchestra",
  ui: {
    primary: "#30a1e2",
    accent: "#8b4513",
    highlight: "#f5f5dc",
    gold: "#ffd700",
    info: "#7c9070",
    danger: "#8b0000",
    background: "#2c1e0f",
    surface: "#58350c63",
    border: "#3748df",
    text: "#fff8dc",
  },
  targets: {
    regular: { mode: "sprite", texture: "orchestra-regular", color: 0xd4af37 },
    golden: { mode: "sprite", texture: "orchestra-golden", color: 0xffd700 },
    bomb: { mode: "sprite", texture: "orchestra-bomb", color: 0x8b0000 },
    multi: {
      mode: "sprite",
      texture: "orchestra-multi-3",
      color: 0xd4af37,
      states: {
        multi_3: "orchestra-multi-3",
        multi_2: "orchestra-multi-2",
        multi_1: "orchestra-multi-1",
      },
    },
    shielded: {
      mode: "sprite",
      texture: "orchestra-shield-up",
      color: 0x708090,
      states: {
        shield_up: "orchestra-shield-up",
        shield_down: "orchestra-shield-down",
      },
    },
    splitter: {
      mode: "sprite",
      texture: "orchestra-splitter",
      color: 0xd4af37,
      fragmentTextures: [
        "orchestra-frag1",
        "orchestra-frag2",
        "orchestra-frag3",
      ],
    },
    sticky: { mode: "sprite", texture: "orchestra-sticky", color: 0x8b4513 },
  },
  particles: {
    golden: [0xffffff, 0xffd700],
    bomb: [0x87ceeb, 0xffffff],
    milestone: [0xd4af37, 0xffffff],
  },
  background: { kind: "image", texture: "orchestra-bg", color: 0x2c1e0f },
  fonts: { display: "serif", body: "serif" },
  defaultSoundPack: ORCHESTRA_SOUND_PACK_ID,
  hud: DEFAULT_HUD_SPEC,
  vfx: {
    hitParticleShape: "circle",
    hitParticleScale: 1.2,
    goldenSparkle: "starburst",
    bombExplosion: "firework",
  },
};
