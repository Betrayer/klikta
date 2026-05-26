import type { TargetKind } from "../../data/targetConfig";

export const BASE_HP = 3;
export const DEFAULT_COMBO_CAP = 5;

export const SCORE_PER_CURRENCY = 100;

const COMBO_BONUS_TIERS: readonly { minCombo: number; bonus: number }[] =
  [
    { minCombo: 100, bonus: 100 },
    { minCombo: 50, bonus: 40 },
    { minCombo: 25, bonus: 15 },
    { minCombo: 10, bonus: 5 },
  ];

export const comboBonusForMax = (maxCombo: number): number => {
  for (const tier of COMBO_BONUS_TIERS) {
    if (maxCombo >= tier.minCombo) return tier.bonus;
  }
  return 0;
};

export const ACHIEVEMENT_REWARDS = {
  "first-run": 50,
  "combo-25": 25,
  "combo-50": 75,
  "combo-100": 200,
  "no-bomb-clicks": 100,
} as const satisfies Record<string, number>;

export const CHARGE_PER_HIT: Record<TargetKind, number> = {
  regular: 1,
  golden: 3,
  multi: 2,
  shielded: 2.5,
  splitter: 1.5,
  sticky: 1.5,
  bomb: 0,
};
export const CHARGE_PER_COMBO_MILESTONE = 5;
export const MAX_CHARGE = 100;

export const TIMER_INITIAL_MS = 30000;
export const TIMER_LOW_WARNING_MS = 5000;
export const TIMER_BOMB_PENALTY_MS = 3000;

export const TIMER_GAIN_BY_KIND: Record<TargetKind, number> = {
  regular: 300,
  golden: 800,
  multi: 1000,
  shielded: 600,
  splitter: 400,
  sticky: 400,
  bomb: 0,
};

export const SPLITTER_FRAGMENT_COUNT = 3;
export const SPLITTER_FRAGMENT_LIFETIME_MS = 1200;
export const SPLITTER_FRAGMENT_SIZE_MUL = 0.5;
export const SPLITTER_FRAGMENT_SCORE_MUL = 0.5;
export const SPLITTER_FRAGMENT_SPREAD_MIN = 52;
export const SPLITTER_FRAGMENT_SPREAD_RANGE = 64;

export const VICTORY_BONUS_CURRENCY = 150;

export const STICKY_SCORE_PER_CLICK = 15;
export const STICKY_MAX_CLUSTER = 5;

export const PHYSICS_BODY_CAP = 40;
export const PHYSICS_SPEED_MIN = 2.4;
export const PHYSICS_SPEED_RANGE = 2.6;
export const PHYSICS_MAX_SPEED = 9;
export const PHYSICS_SPIN_RANGE = 0.12;
export const PHYSICS_RESTITUTION = 1;
export const PHYSICS_WALL_THICKNESS = 120;
export const PHYSICS_CLICK_IMPULSE = 7;
export const PHYSICS_CLICK_RADIUS = 220;
export const PHYSICS_INTERVAL_SCALE = 1.25;
export const PHYSICS_MULTI_CLICKS = 2;
export const PHYSICS_FIXED_STEP_MS = 1000 / 60;
export const PHYSICS_MAX_SUBSTEPS = 5;
