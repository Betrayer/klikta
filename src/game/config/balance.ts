import type { TargetKind } from "../../data/targetConfig";

export const BASE_HP = 3;
export const DEFAULT_COMBO_CAP = 5;

export const SCORE_PER_CURRENCY = 100;

export const COMBO_BONUS_TIERS: readonly { minCombo: number; bonus: number }[] =
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
  bomb: 0,
};
