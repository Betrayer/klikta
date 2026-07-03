import type { Theme } from "./types";
import { DEFAULT_HUD_SPEC } from "./defaults";
import { FASTFOOD_SOUND_PACK_ID } from "../sound/fastfoodPack";

export const fastfoodTheme: Theme = {
  id: "fastfood",
  name: "Fast Food",
  ui: {
    primary: "#b1a42e",
    accent: "#ff332c",
    highlight: "#64bdd8",
    gold: "#ffc72c",
    info: "#0067b1",
    danger: "#d70f0b",
    background: "#7bb1e7",
    surface: "#694a33a1",
    border: "#d70f0b",
    text: "#2b2b2b",
  },
  targets: {
    regular: { mode: "sprite", texture: "fastfood-regular", color: 0xd70f0b },
    golden: { mode: "sprite", texture: "fastfood-golden", color: 0xffc72c },
    bomb: { mode: "sprite", texture: "fastfood-bomb", color: 0x0067b1 },
    multi: {
      mode: "sprite",
      texture: "fastfood-multi-3",
      color: 0xffc72c,
      states: {
        multi_3: "fastfood-multi-3",
        multi_2: "fastfood-multi-2",
        multi_1: "fastfood-multi-1",
      },
    },
    shielded: {
      mode: "sprite",
      texture: "fastfood-shield-up",
      color: 0x0067b1,
      states: {
        shield_up: "fastfood-shield-up",
        shield_down: "fastfood-shield-down",
      },
    },
    splitter: {
      mode: "sprite",
      texture: "fastfood-splitter",
      color: 0xd70f0b,
      fragmentTextures: ["fastfood-frag1", "fastfood-frag2", "fastfood-frag3"],
    },
    sticky: { mode: "sprite", texture: "fastfood-sticky", color: 0xffc72c },
  },
  particles: {
    golden: [0xffffff, 0xffc72c],
    bomb: [0x0067b1, 0xffffff],
    milestone: [0xd70f0b, 0xffc72c],
  },
  background: {
    kind: "image",
    texture: "fastfood-bg",
    color: 0xf8f9fa,
  },
  fonts: { display: "impact, sans-serif", body: "system-ui, sans-serif" },
  defaultSoundPack: FASTFOOD_SOUND_PACK_ID,
  hud: DEFAULT_HUD_SPEC,
  vfx: {
    hitParticleShape: "circle",
    hitParticleScale: 1.2,
    goldenSparkle: "starburst",
    bombExplosion: "firework",
  },
};
