import type { HudSpec, VfxStyleSpec } from "./types";

export const DEFAULT_HUD_SPEC: HudSpec = {
  style: "framed",
  surface: "rgba(0, 0, 0, 0.4)",
  score: { frame: "rounded", accent: "primary", position: "top-left" },
  wave: { accent: "info", position: "top-center" },
  hp: { type: "hearts", accent: "highlight", position: "top-right" },
  combo: { accent: "highlight", position: "top-center", bumpScale: 1.25 },
  timer: { accent: "highlight", lowAccent: "danger", position: "top-right" },
  ultimate: { position: "bottom-center", surface: "rgba(0, 0, 0, 0.55)" },
};

export const DEFAULT_VFX_STYLE: Required<VfxStyleSpec> = {
  hitParticleShape: "circle",
  hitParticleScale: 1,
  goldenSparkle: "standard",
  bombExplosion: "standard",
};
