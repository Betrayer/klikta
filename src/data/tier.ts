export type TierLevel = 1 | 2 | 3 | 4;

export const TIER_REQUIRES_POINTS: Readonly<Record<TierLevel, number>> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
};
