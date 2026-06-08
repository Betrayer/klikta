import type { Theme } from "./types";
import { synthwaveTheme } from "./synthwave";

export const daybreakTheme: Theme = {
  ...synthwaveTheme,
  id: "daybreak",
  name: "Daybreak",
  ui: {
    primary: "#e8467a",
    accent: "#1d9bd1",
    highlight: "#16b39a",
    gold: "#e0a500",
    info: "#3a86ff",
    danger: "#e02d4f",
    background: "#fbf3ef",
    surface: "#fff8f4",
    border: "#e7d3c8",
    text: "#2a1a22",
  },
  targets: {
    regular: { mode: "vector", shape: "circle", color: 0xe8467a },
    golden: { mode: "vector", shape: "circle", color: 0xe0a500 },
    bomb: { mode: "vector", shape: "star", color: 0xe02d4f },
    multi: { mode: "vector", shape: "circle", color: 0x3a86ff },
    shielded: { mode: "vector", shape: "circle", color: 0x8b5cf6 },
    splitter: { mode: "vector", shape: "circle", color: 0xf2740c },
    sticky: { mode: "vector", shape: "circle", color: 0x14b8a6 },
  },
  particles: {
    golden: [0xffffff, 0xe0a500],
    bomb: [0xe02d4f, 0xf2740c],
    milestone: [0x16b39a, 0xffffff],
  },
  background: {
    kind: "animated_gradient",
    color: 0xfde4d4,
    colorStops: [0xfde4d4, 0xf9d0e0, 0xe0e8ff, 0xd4f0ea],
    animationSpeedSec: 5,
  },
};
