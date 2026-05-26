import type { SkillBranch } from "../skillTree";
import { TIER_REQUIRES_POINTS } from "../tier";

export const REACTION_BRANCH: SkillBranch = {
  id: "reaction",
  name: "Reaction",
  description: "Easier targets, more time, calmer rhythm.",
  color: "#00f0ff",
  tiers: [
    {
      tier: 1,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[1],
      options: [
        {
          id: "reaction-t1-steady-hand",
          name: "Steady Hand",
          description: "Every target stays alive 20% longer.",
          icon: "steady-hand",
          cost: 50,
          effects: [{ kind: "targetLifetimeMul", value: 1.2 }],
        },
        {
          id: "reaction-t1-bigger-targets",
          name: "Bigger Targets",
          description: "All targets are 15% larger.",
          icon: "bigger-targets",
          cost: 80,
          effects: [{ kind: "targetSizeMul", value: 1.15 }],
        },
        {
          id: "reaction-t1-balanced",
          name: "Balanced",
          description: "+10% lifetime and +8% size on every target.",
          icon: "balanced",
          cost: 100,
          effects: [
            { kind: "targetLifetimeMul", value: 1.1 },
            { kind: "targetSizeMul", value: 1.08 },
          ],
        },
      ],
    },
    {
      tier: 2,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[2],
      options: [
        {
          id: "reaction-t2-bomb-warning",
          name: "Bomb Warning",
          description: "Bombs blink twice as fast in their last second.",
          icon: "alert-triangle",
          cost: 250,
          effects: [{ kind: "bombBlinkFasterEndS", value: 1 }],
        },
        {
          id: "reaction-t2-quick-multi",
          name: "Quick Multi",
          description: "Multi targets only need 2 clicks instead of 3.",
          icon: "target",
          cost: 300,
          effects: [{ kind: "multiClicksRequired", value: 2 }],
        },
        {
          id: "reaction-t2-pre-crack",
          name: "Pre-Crack",
          description:
            "Shielded targets lose their shield even on a missed click.",
          icon: "crack",
          cost: 350,
          effects: [{ kind: "shieldedShieldBreaksOnMiss" }],
        },
      ],
    },
    {
      tier: 3,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[3],
      options: [
        {
          id: "reaction-t3-golden-patience",
          name: "Golden Patience",
          description: "Golden targets stay 50% longer.",
          icon: "hourglass",
          cost: 600,
          effects: [{ kind: "goldenLifetimeMul", value: 1.5 }],
        },
        {
          id: "reaction-t3-slow-spawn",
          name: "Slow Spawn",
          description:
            "Spawn animation is 50% slower - you see targets sooner.",
          icon: "eye",
          cost: 700,
          effects: [{ kind: "spawnAnimMul", value: 1.5 }],
        },
      ],
    },
    {
      tier: 4,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[4],
      options: [
        {
          id: "reaction-t4-time-slow",
          name: "Time Slow",
          description: "Ultimate: slow the world to half speed for 5 seconds.",
          icon: "clock",
          cost: 2200,
          effects: [{ kind: "ultimateUnlock", id: "time-slow" }],
        },
      ],
    },
  ],
};
