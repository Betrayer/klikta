import type { Theme } from "./types";
import { AURORA_SOUND_PACK_ID } from "../sound/auroraPack";

export const auroraTheme: Theme = {
  id: "aurora",
  name: "Aurora",
  ui: {
    primary: "#34d399",
    accent: "#a78bfa",
    highlight: "#22d3ee",
    gold: "#ffd24a",
    info: "#60a5fa",
    danger: "#ff4d6d",
    background: "#04121a",
    surface: "#07202b",
    border: "#0e3a44",
    text: "#e6fffb",
  },
  targets: {
    regular: { mode: "sprite", texture: "aurora-regular", color: 0x4ade80 },
    golden: { mode: "sprite", texture: "aurora-golden", color: 0xffd24a },
    bomb: { mode: "sprite", texture: "aurora-bomb", color: 0xff4d6d },
    multi: { mode: "sprite", texture: "aurora-multi", color: 0x60a5fa },
    shielded: { mode: "sprite", texture: "aurora-shielded", color: 0xa78bfa },
    splitter: { mode: "sprite", texture: "aurora-splitter", color: 0xfb923c },
    sticky: { mode: "sprite", texture: "aurora-sticky", color: 0x22d3ee },
  },
  particles: {
    golden: [0xffffff, 0xffd24a],
    bomb: [0xff4d6d, 0xff922b],
    milestone: [0x22d3ee, 0xffffff],
  },
  background: { kind: "solid", color: 0x04121a },
  fonts: { display: "monospace", body: "system-ui, sans-serif" },
  defaultSoundPack: AURORA_SOUND_PACK_ID,
};
