export type TargetKind = "regular" | "golden" | "bomb" | "multi" | "shielded";

export interface TargetTypeConfig {
  score: number;
  lifetimeMs: number;
  radius: number;
  color: number;
  shrinks: boolean;
  clicksRequired: number;
  spawnWeight: number;
}

export const TARGET_CONFIG: Record<TargetKind, TargetTypeConfig> = {
  regular: {
    score: 10,
    lifetimeMs: 2500,
    radius: 40,
    color: 0xff006e,
    shrinks: true,
    clicksRequired: 1,
    spawnWeight: 60,
  },
  golden: {
    score: 50,
    lifetimeMs: 1000,
    radius: 30,
    color: 0xffd700,
    shrinks: true,
    clicksRequired: 1,
    spawnWeight: 8,
  },
  bomb: {
    score: 0,
    lifetimeMs: 4000,
    radius: 38,
    color: 0xff1f3f,
    shrinks: false,
    clicksRequired: 1,
    spawnWeight: 12,
  },
  multi: {
    score: 30,
    lifetimeMs: 3000,
    radius: 44,
    color: 0x3a86ff,
    shrinks: true,
    clicksRequired: 3,
    spawnWeight: 12,
  },
  shielded: {
    score: 40,
    lifetimeMs: 3500,
    radius: 40,
    color: 0x9d4edd,
    shrinks: true,
    clicksRequired: 2,
    spawnWeight: 8,
  },
};
