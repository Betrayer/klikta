import type { Theme } from "./types";
import { DEFAULT_HUD_SPEC } from "./defaults";
import { CATS_SOUND_PACK_ID } from "../sound/catsPack";

export const catsTheme: Theme = {
  id: "cats",
  name: "Cats",
  ui: {
    primary: "#ff8cbf",
    accent: "#ffb74d",
    highlight: "#ffd54f",
    gold: "#ffca28",
    info: "#64b5f6",
    danger: "#ff5252",
    background: "#2d262a",
    surface: "#3e363a",
    border: "#5d5458",
    text: "#fff0f5",
  },
  targets: {
    regular: { mode: "sprite", texture: "cats-regular", color: 0xff8cbf },
    golden: { mode: "sprite", texture: "cats-golden", color: 0xffca28 },
    bomb: { mode: "sprite", texture: "cats-bomb", color: 0xff5252 },
    multi: {
      mode: "sprite",
      texture: "cats-multi-3",
      color: 0xffb74d,
      states: {
        multi_3: "cats-multi-3",
        multi_2: "cats-multi-2",
        multi_1: "cats-multi-1",
      },
    },
    shielded: {
      mode: "sprite",
      texture: "cats-shield-up",
      color: 0x64b5f6,
      states: {
        shield_up: "cats-shield-up",
        shield_down: "cats-shield-down",
      },
    },
    splitter: {
      mode: "sprite",
      texture: "cats-splitter",
      color: 0x64b5f6,
      fragmentTextures: ["cats-frag1", "cats-frag2", "cats-frag3"],
    },
    sticky: { mode: "sprite", texture: "cats-sticky", color: 0xff8cbf },
  },
  particles: {
    golden: [0xffffff, 0xffca28],
    bomb: [0xff5252, 0xffa0a0],
    milestone: [0xffd54f, 0xffffff],
  },
  background: {
    kind: "bokeh",
    color: 0x332415,
    bokehColor: 0xd8a1a1,
    bokehDensity: 12,
    animationSpeedSec: 12,
  },
  fonts: { display: "cursive", body: "system-ui, sans-serif" },
  defaultSoundPack: CATS_SOUND_PACK_ID,
  hud: DEFAULT_HUD_SPEC,
  vfx: {
    hitParticleShape: "circle",
    hitParticleScale: 1.1,
    goldenSparkle: "starburst",
    bombExplosion: "firework",
  },
};
