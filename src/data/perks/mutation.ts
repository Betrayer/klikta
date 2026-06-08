import type { SkillBranch } from "../skillTree";
import { TIER_REQUIRES_POINTS } from "../tier";

export const MUTATION_BRANCH: SkillBranch = {
  id: "mutation",
  name: "Mutation",
  description:
    "Distort the rules. Every perk gives both a cost and a reward - skill decides which dominates.",
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
          icon: "sprout",
          cost: 50,
          effects: [{ kind: "slowBloomPhaseMs", value: 500 }],
        },
        {
          id: "mutation-t1-beacon-bombs",
          name: "Beacon Bombs",
          description:
            "Bombs grow to 150% over their lifetime instead of blinking. More visible, more space.",
          icon: "beacon",
          cost: 80,
          effects: [{ kind: "beaconBombs", growToScale: 1.5 }],
        },
        {
          id: "mutation-t1-convergent",
          name: "Convergent",
          description:
            "All targets drift toward screen center at ~30 px/s. Tighter cluster - bombs too. Stacks with both Magnet perks - Convergent + Cursor Magnet creates a 'gravity well' at the cursor near center.",
          icon: "converge",
          cost: 100,
          effects: [{ kind: "convergentDriftSpeed", value: 30 }],
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
          icon: "ghost",
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
          icon: "repeat",
          cost: 300,
          effects: [{ kind: "echoPhantomMs", duration: 800, bonusMul: 1.3 }],
        },
        {
          id: "mutation-t2-magnet",
          name: "Magnet",
          description:
            "All interactive objects drift toward your cursor at ~18 px/s. Bombs included. Stacks with Wild's Cursor Magnet for compound drift toward the cursor.",
          icon: "compass",
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
            "Every target spawns with a mirrored twin. Click either to destroy both; only the clicked one scores. 10% of twins are bombs - read carefully.",
          icon: "mirror",
          cost: 600,
          effects: [{ kind: "mirrorSpawn", bombTwinChance: 0.1 }],
        },
        {
          id: "mutation-t3-time-pulse",
          name: "Time Pulse",
          description:
            "Every 6 s, 2 s of either ×0.6 or ×1.6 game speed. HUD warns 0.5 s before.",
          icon: "stopwatch",
          cost: 700,
          effects: [{ kind: "timePulse", periodMs: 6000, durationMs: 2000 }],
        },
        {
          id: "mutation-t3-vortex",
          name: "Vortex",
          description:
            "All targets orbit your last successful hit position at their current distance. Bombs included - your focus becomes their attractor.",
          icon: "tornado",
          cost: 700,
          effects: [{ kind: "vortexOrbitSpeed", radPerSec: 0.78 }],
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
            "Ultimate: 5 s where targets and bombs grow from 100% to 200% over their lifetime, current spawn rate doubles, and all scores ×2.",
          icon: "flower",
          cost: 2600,
          effects: [{ kind: "ultimateUnlock", id: "bloom" }],
        },
      ],
    },
  ],
};
