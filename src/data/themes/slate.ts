import type { Theme } from "./types";
import { synthwaveTheme } from "./synthwave";

export const slateTheme: Theme = {
  ...synthwaveTheme,
  id: "slate",
  name: "Slate",
  ui: {
    primary: "#6b7a8f",
    accent: "#8a9bb0",
    highlight: "#9fb0c0",
    gold: "#c9b072",
    info: "#7088a8",
    danger: "#c05a6a",
    background: "#15181c",
    surface: "#1b1f24",
    border: "#2a3038",
    text: "#dfe4ea",
  },
  targets: {
    regular: { mode: "vector", shape: "circle", color: 0x8a9bb0 },
    golden: { mode: "vector", shape: "circle", color: 0xc9b072 },
    bomb: { mode: "vector", shape: "star", color: 0xc05a6a },
    multi: { mode: "vector", shape: "circle", color: 0x7088a8 },
    shielded: { mode: "vector", shape: "circle", color: 0x9a86b0 },
    splitter: { mode: "vector", shape: "circle", color: 0xb08560 },
    sticky: { mode: "vector", shape: "circle", color: 0x6fb0a4 },
  },
  particles: {
    golden: [0xffffff, 0xc9b072],
    bomb: [0xc05a6a, 0xb08560],
    milestone: [0x9fb0c0, 0xffffff],
  },
  background: {
    kind: "animated_gradient",
    color: 0x15181c,
    colorStops: [0x15181c, 0x1c2128, 0x202831, 0x181d22],
    animationSpeedSec: 5,
  },
};
