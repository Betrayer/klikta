import type { Theme } from "./types";

export const synthwaveTheme: Theme = {
  id: "synthwave",
  name: "Synthwave",
  ui: {
    primary: "#ff006e",
    accent: "#00f0ff",
    background: "#0a0014",
    surface: "#0d0118",
    text: "#e9ecef",
  },
  targets: {
    regular: { mode: "vector", shape: "circle", color: 0xff006e },
    golden: { mode: "vector", shape: "circle", color: 0xffd700 },
    bomb: { mode: "vector", shape: "star", color: 0xff1f3f },
    multi: { mode: "vector", shape: "circle", color: 0x3a86ff },
    shielded: { mode: "vector", shape: "circle", color: 0x9d4edd },
    splitter: { mode: "vector", shape: "circle", color: 0xfb5607 },
    sticky: { mode: "vector", shape: "circle", color: 0x2ec4b6 },
  },
  particles: {
    golden: [0xffffff, 0xffd700],
    bomb: [0xff1f3f, 0xff8c00],
    milestone: [0x00f5d4, 0xffffff],
  },
  background: { kind: "solid", color: 0x1a0033 },
  fonts: { display: "monospace", body: "system-ui, sans-serif" },
  defaultSoundPack: "default",
};
