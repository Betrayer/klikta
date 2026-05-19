import type { SkillBranch } from "../skillTree";
import { TIER_REQUIRES_POINTS } from "../skillTree";

export const MUTATION_BRANCH: SkillBranch = {
  id: "mutation",
  name: "Mutation",
  description:
    "Distort the rules. Every perk gives both a cost and a reward — skill decides which dominates.",
  color: "#9d4edd",
  tiers: [
    {
      tier: 1,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[1],
      options: [
        {
          id: "mutation-t1-slow-bloom",
          name: "Slow Bloom",
          description:
            "Targets grow for their first 0.5 s, then shrink. Bigger early window, different rhythm.",
          icon: "🌱",
          cost: 50,
          effects: [{ kind: "slowBloomPhaseMs", value: 500 }],
        },
        {
          id: "mutation-t1-beacon-bombs",
          name: "Beacon Bombs",
          description:
            "Bombs grow to 150% over their lifetime instead of blinking. More visible, more space.",
          icon: "🚨",
          cost: 80,
          effects: [{ kind: "beaconBombs", growToScale: 1.5 }],
        },
        {
          id: "mutation-t1-convergent",
          name: "Convergent",
          description:
            "All targets drift toward screen center at 5 px/s. Tighter cluster — bombs too.",
          icon: "🎯",
          cost: 100,
          effects: [{ kind: "convergentDriftSpeed", value: 5 }],
        },
      ],
    },
    {
      tier: 2,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[2],
      options: [
        {
          id: "mutation-t2-phase-flash",
          name: "Phase Flash",
          description:
            "Targets fade to 10% alpha for 150 ms every 700 ms. Clicking while invisible = ×2 score.",
          icon: "👻",
          cost: 250,
          effects: [
            {
              kind: "phaseFlashCycle",
              periodMs: 700,
              invisibleMs: 150,
              bonusMul: 2,
            },
          ],
        },
        {
          id: "mutation-t2-echo",
          name: "Echo",
          description:
            "Every hit leaves an 800 ms phantom. Clicking the phantom adds 30% bonus score without breaking combo.",
          icon: "🔁",
          cost: 300,
          effects: [
            { kind: "echoPhantomMs", duration: 800, bonusMul: 1.3 },
          ],
        },
        {
          id: "mutation-t2-magnet",
          name: "Magnet",
          description:
            "All interactive objects drift toward your cursor at ~18 px/s. Bombs included.",
          icon: "🧭",
          cost: 350,
          effects: [{ kind: "magnetSpeed", value: 18 }],
        },
      ],
    },
    {
      tier: 3,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[3],
      options: [
        {
          id: "mutation-t3-mirror-spawn",
          name: "Mirror Spawn",
          description:
            "Every target spawns with a mirrored twin. Clicking either destroys both; score awarded only for the clicked one.",
          icon: "🪞",
          cost: 600,
          effects: [{ kind: "mirrorSpawn" }],
        },
        {
          id: "mutation-t3-time-pulse",
          name: "Time Pulse",
          description:
            "Every 6 s, 2 s of either ×0.6 or ×1.6 game speed. HUD warns 0.5 s before.",
          icon: "⏱️",
          cost: 700,
          effects: [{ kind: "timePulse", periodMs: 6000, durationMs: 2000 }],
        },
      ],
    },
    {
      tier: 4,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[4],
      options: [
        {
          id: "mutation-t4-bloom",
          name: "Bloom",
          description:
            "Ultimate: 5 s where all targets and bombs grow from 100% to 200% over their lifetime. Scores ×2.",
          icon: "🌸",
          cost: 2200,
          effects: [{ kind: "ultimateUnlock", id: "bloom" }],
        },
      ],
    },
  ],
};
