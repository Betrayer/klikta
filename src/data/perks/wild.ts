import type { SkillBranch } from "../skillTree";
import { TIER_REQUIRES_POINTS } from "../tier";

export const WILD_BRANCH: SkillBranch = {
  id: "wild",
  name: "Wild",
  description: "Chaos rewards the bold and punishes the lazy.",
  color: "#ff006e",
  tiers: [
    {
      tier: 1,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[1],
      options: [
        {
          id: "wild-t1-volatile-time",
          name: "Volatile Time",
          description: "Each target's lifetime varies randomly by ±50%.",
          icon: "🎰",
          cost: 50,
          effects: [{ kind: "lifetimeJitterPct", value: 0.5 }],
        },
        {
          id: "wild-t1-concentrated",
          name: "Concentrated",
          description:
            "Bomb spawn weight halved, but every 5th target is guaranteed a bomb.",
          icon: "💣",
          cost: 80,
          effects: [{ kind: "bombWeightHalvedEveryFifthBomb" }],
        },
        {
          id: "wild-t1-lucky-big",
          name: "Lucky Big",
          description:
            "5% chance a target spawns at 2× size and awards 2× score.",
          icon: "🍀",
          cost: 100,
          effects: [
            { kind: "oversizeChance", value: 0.05, sizeMul: 2, scoreMul: 2 },
          ],
        },
      ],
    },
    {
      tier: 2,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[2],
      options: [
        {
          id: "wild-t2-decoy-gold",
          name: "Decoy Gold",
          description: "15% of bombs disguise themselves as golden targets.",
          icon: "🎭",
          cost: 250,
          effects: [{ kind: "bombDecoyChance", value: 0.15 }],
        },
        {
          id: "wild-t2-rush-pulse",
          name: "Rush Pulse",
          description: "Every 30 seconds, spawn rate triples for 5 seconds.",
          icon: "🌊",
          cost: 300,
          effects: [
            {
              kind: "spawnRateSurgeEveryMs",
              period: 30000,
              durationMs: 5000,
              mul: 3,
            },
          ],
        },
      ],
    },
    {
      tier: 3,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[3],
      options: [
        {
          id: "wild-t3-mortgage",
          name: "Mortgage",
          description: "All scores ×2 this run, but you earn no currency.",
          icon: "🏦",
          cost: 600,
          effects: [{ kind: "scoreDoubledNoCurrency" }],
        },
        {
          id: "wild-t3-cursor-magnet",
          name: "Cursor Magnet",
          description:
            "Targets drift toward your cursor at ~25 px/s — stronger than mutation magnet.",
          icon: "🧲",
          cost: 700,
          effects: [{ kind: "targetsFollowCursorSpeed", value: 25 }],
        },
      ],
    },
    {
      tier: 4,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[4],
      options: [
        {
          id: "wild-t4-chaos-storm",
          name: "Chaos Storm",
          description:
            "Ultimate: 4 seconds of ×4 spawn rate, fully randomized target types, glitch shader.",
          icon: "🌀",
          cost: 2200,
          effects: [{ kind: "ultimateUnlock", id: "chaos-storm" }],
        },
      ],
    },
  ],
};
