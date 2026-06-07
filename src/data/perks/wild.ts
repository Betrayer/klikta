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
          icon: "shuffle",
          cost: 50,
          effects: [{ kind: "lifetimeJitterPct", value: 0.5 }],
        },
        {
          id: "wild-t1-concentrated",
          name: "Concentrated",
          description:
            "Bomb spawn weight halved, but every 5th target is guaranteed a bomb. Pair with Reaction Steady Bombs for fully predictable bomb placement.",
          icon: "bomb",
          cost: 80,
          effects: [{ kind: "bombWeightHalvedEveryFifthBomb" }],
        },
        {
          id: "wild-t1-lucky-big",
          name: "Lucky Big",
          description:
            "5% chance a target spawns at 2× size and awards 2× score.",
          icon: "clover",
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
          id: "wild-t2-greedy-spawn",
          name: "Greedy Spawn",
          description:
            "20% chance a target spawns at 60% size and awards ×2 score. Stacks well with Reaction's Bigger Targets.",
          icon: "diamond",
          cost: 250,
          effects: [
            { kind: "oversizeChance", value: 0.2, sizeMul: 0.6, scoreMul: 2 },
          ],
        },
        {
          id: "wild-t2-rush-pulse",
          name: "Rush Pulse",
          description:
            "Every 30 s, spawn rate triples for 5 s. During the surge, misses don't break your combo.",
          icon: "wave",
          cost: 300,
          effects: [
            {
              kind: "spawnRateSurgeEveryMs",
              period: 30000,
              durationMs: 5000,
              mul: 3,
              comboProtected: true,
            },
          ],
        },
        {
          id: "wild-t2-spark",
          name: "Spark",
          description:
            "7% chance a hit chains to a nearby target, which chains again - up to 7 hops. Bombs are skipped. Pure chaos cascade.",
          icon: "lightning",
          cost: 300,
          effects: [
            {
              kind: "chainHit",
              triggerChance: 0.07,
              maxHops: 7,
              radiusMul: 1.5,
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
          description:
            "+50% score this run, but currency earned is halved. Stack with Reckless to push high-risk leaderboard runs.",
          icon: "bank",
          cost: 600,
          effects: [
            { kind: "scoreCurrencyTradeoff", scoreMul: 1.5, currencyMul: 0.5 },
          ],
        },
        {
          id: "wild-t3-cursor-magnet",
          name: "Cursor Magnet",
          description:
            "Targets drift toward your cursor at ~25 px/s - stacks with mutation magnet. Also stacks with Mutation Convergent for triple pull.",
          icon: "magnet",
          cost: 700,
          effects: [{ kind: "targetsFollowCursorSpeed", value: 25 }],
        },
        {
          id: "wild-t3-last-stand",
          name: "Last Stand",
          description:
            "While at 1 HP: ×3 score, but lifetimes are 20% shorter. Pair with Survival's Phoenix to enter Last Stand on demand.",
          icon: "skull",
          cost: 700,
          effects: [
            { kind: "lastStandAtLowHp", scoreMul: 3, lifetimeMul: 0.8 },
          ],
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
          icon: "cyclone",
          cost: 2600,
          effects: [{ kind: "ultimateUnlock", id: "chaos-storm" }],
        },
      ],
    },
  ],
};
