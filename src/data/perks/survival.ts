import type { SkillBranch } from "../skillTree";
import { TIER_REQUIRES_POINTS } from "../tier";

export const SURVIVAL_BRANCH: SkillBranch = {
  id: "survival",
  name: "Survival",
  description: "Forgiveness, second chances, more HP.",
  color: "#00ff88",
  tiers: [
    {
      tier: 1,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[1],
      options: [
        {
          id: "survival-t1-warm-up",
          name: "Warm-Up",
          description: "Your first missed target each run is forgiven.",
          icon: "sunrise",
          cost: 50,
          effects: [{ kind: "firstMissForgiven" }],
        },
        {
          id: "survival-t1-soft-bombs",
          name: "Soft Bombs",
          description:
            "After the first bomb-click per run, further bomb-clicks cost no HP.",
          icon: "shield",
          cost: 80,
          effects: [{ kind: "bombClickFreeAfterFirst" }],
        },
        {
          id: "survival-t1-extra-life",
          name: "Extra Life",
          description:
            "Start every run with one additional HP. Combine with Survival Phoenix for two recoveries per run.",
          icon: "heart",
          cost: 100,
          effects: [{ kind: "startingHPAdd", value: 1 }],
        },
      ],
    },
    {
      tier: 2,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[2],
      options: [
        {
          id: "survival-t2-score-heal",
          name: "Score Heal",
          description:
            "Every 1000 score restores 1 HP. Greed's Score Boost reaches each 1000-score threshold faster.",
          icon: "heart-plus",
          cost: 250,
          effects: [{ kind: "hpRegenPer1000Score", value: 1 }],
        },
        {
          id: "survival-t2-open-field",
          name: "Open Field",
          description: "Clicking the background no longer breaks combo.",
          icon: "wheat",
          cost: 300,
          effects: [{ kind: "backgroundClickIgnored" }],
        },
        {
          id: "survival-t2-bandage",
          name: "Bandage",
          description:
            "Reaching combo 50 or 100 restores 1 HP. Pairs strongly with Greed's Combo Climb (×8 cap -> more milestones).",
          icon: "first-aid-kit",
          cost: 300,
          effects: [
            {
              kind: "hpHealAtComboMilestones",
              milestones: [50, 100],
              healAmount: 1,
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
          id: "survival-t3-mercy",
          name: "Mercy",
          description: "1 second of invulnerability after taking damage.",
          icon: "sparkles",
          cost: 600,
          effects: [{ kind: "damageIframesMs", value: 1000 }],
        },
        {
          id: "survival-t3-shield-forgiveness",
          name: "Shield Forgiveness",
          description:
            "A missed shielded target breaks your combo but costs no HP.",
          icon: "shield-heart",
          cost: 700,
          effects: [{ kind: "shieldedMissNoHPLoss" }],
        },
        {
          id: "survival-t3-phoenix",
          name: "Phoenix",
          description:
            "Once per run, surviving a fatal hit restores you to 1 HP with 3 s of invulnerability. Pair with Wild's Last Stand for high-risk recovery plays.",
          icon: "flame-heart",
          cost: 700,
          effects: [{ kind: "phoenixRevive", iframesMs: 3000 }],
        },
      ],
    },
    {
      tier: 4,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[4],
      options: [
        {
          id: "survival-t4-restore",
          name: "Restore",
          description:
            "Ultimate: heal to full HP. Disables HP regen perks for the rest of the run.",
          icon: "circle-plus",
          cost: 2200,
          effects: [{ kind: "ultimateUnlock", id: "restore" }],
        },
      ],
    },
  ],
};
