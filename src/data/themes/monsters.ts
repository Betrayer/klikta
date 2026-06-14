import type { Theme } from "./types";
import { DEFAULT_HUD_SPEC } from "./defaults";
import { MONSTERS_SOUND_PACK_ID } from "../sound/monstersPack";

export const monstersTheme: Theme = {
  id: "monsters",
  name: "Monster slayer",
  ui: {
    primary: "#8b0000",
    accent: "#4b0082",
    highlight: "#d3d3d3",
    gold: "#ffd700",
    info: "#9370db",
    danger: "#ff0000",
    background: "#1a0a0a",
    surface: "#3a0808",
    border: "#4a0404",
    text: "#f5f5f5",
  },
  targets: {
    regular: { mode: "sprite", texture: "monsters-regular", color: 0x8b0000 },
    golden: { mode: "sprite", texture: "monsters-golden", color: 0xffd700 },
    bomb: { mode: "sprite", texture: "monsters-bomb", color: 0xff4500 },
    multi: {
      mode: "sprite",
      texture: "monsters-multi-3",
      color: 0x4b0082,
      states: {
        multi_3: "monsters-multi-3",
        multi_2: "monsters-multi-2",
        multi_1: "monsters-multi-1",
      },
    },
    shielded: {
      mode: "sprite",
      texture: "monsters-shield-up",
      color: 0x9370db,
      states: {
        shield_up: "monsters-shield-up",
        shield_down: "monsters-shield-down",
      },
    },
    splitter: {
      mode: "sprite",
      texture: "monsters-splitter",
      color: 0x8b0000,
      fragmentTextures: ["monsters-frag1", "monsters-frag2", "monsters-frag3"],
    },
    sticky: { mode: "sprite", texture: "monsters-sticky", color: 0x4b0082 },
  },
  particles: {
    golden: [0xffffff, 0xffd700],
    bomb: [0xff4500, 0x000000],
    milestone: [0x8b0000, 0xffffff],
  },
  background: {
    kind: "bokeh",
    color: 0x0f0505,
    bokehColor: 0x8b0000,
    bokehDensity: 8,
    animationSpeedSec: 10,
  },
  fonts: { display: "serif", body: "system-ui, sans-serif" },
  defaultSoundPack: MONSTERS_SOUND_PACK_ID,
  hud: DEFAULT_HUD_SPEC,
  vfx: {
    hitParticleShape: "circle",
    hitParticleScale: 1.2,
    goldenSparkle: "starburst",
    bombExplosion: "firework",
  },
};
