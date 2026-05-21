import type { TargetKind } from "../../data/targetConfig";

/**
 * Centralized non-feel gameplay balance constants (Phase 3, Task 9).
 *
 * Division of responsibility:
 * - "Feel" numbers (particles, shake, animation timing) live in `feel.ts`.
 * - Per-target stats (score, lifetime, size, spawn weight) live in `targetConfig.ts`.
 * - Perk costs and per-perk effect magnitudes live in `src/data/perks/*.ts`.
 * - This file owns the cross-cutting economy / progression numbers so a balance
 *   pass touches one place.
 *
 * See `docs/phase-3-balance-notes.md` for the progression model these values
 * were tuned against and the assumptions behind each number.
 */

// --- Run baseline ---
export const BASE_HP = 3;
export const DEFAULT_COMBO_CAP = 5;

// --- Currency earned per run ---
/** Base currency for a run = floor(finalScore / SCORE_PER_CURRENCY). */
export const SCORE_PER_CURRENCY = 100;

/**
 * One-time combo bonus added to a run's currency, keyed by the run's max combo.
 * Ordered high-to-low; first matching threshold wins.
 */
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

/**
 * One-time achievement currency rewards (lifetime, persisted in metaStore).
 * Front-loaded so the first handful of runs grant a perk's worth of currency.
 */
export const ACHIEVEMENT_REWARDS = {
  "first-run": 50,
  "combo-25": 25,
  "combo-50": 75,
  "combo-100": 200,
  "no-bomb-clicks": 100,
} as const satisfies Record<string, number>;

// --- Ultimate charge ---
/** Charge added per successful hit, by target kind. Cap is MAX_CHARGE. */
export const CHARGE_PER_HIT: Record<TargetKind, number> = {
  regular: 1,
  golden: 3,
  multi: 2,
  shielded: 2.5,
  bomb: 0,
};
export const CHARGE_PER_COMBO_MILESTONE = 5;
export const MAX_CHARGE = 100;
