import type { SkillBranch } from "../skillTree";
import { TIER_REQUIRES_POINTS } from "../skillTree";

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
          id: "survival-t1-extra-life",
          name: "Extra Life",
          description: "Start every run with one additional HP.",
          icon: "❤️",
          cost: 50,
          effects: [{ kind: "startingHPAdd", value: 1 }],
        },
        {
          id: "survival-t1-soft-bombs",
          name: "Soft Bombs",
          description:
            "After the first bomb-click per run, further bomb-clicks cost no HP.",
          icon: "🛡️",
          cost: 80,
          effects: [{ kind: "bombClickFreeAfterFirst" }],
        },
        {
          id: "survival-t1-warm-up",
          name: "Warm-Up",
          description: "Your first missed target each run is forgiven.",
          icon: "🌅",
          cost: 100,
          effects: [{ kind: "firstMissForgiven" }],
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
          description: "Every 1000 score restores 1 HP.",
          icon: "💚",
          cost: 250,
          effects: [{ kind: "hpRegenPer1000Score", value: 1 }],
        },
        {
          id: "survival-t2-open-field",
          name: "Open Field",
          description: "Clicking the background no longer breaks combo.",
          icon: "🌾",
          cost: 300,
          effects: [{ kind: "backgroundClickIgnored" }],
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
          icon: "✨",
          cost: 600,
          effects: [{ kind: "damageIframesMs", value: 1000 }],
        },
        {
          id: "survival-t3-shield-forgiveness",
          name: "Shield Forgiveness",
          description:
            "A missed shielded target breaks your combo but costs no HP.",
          icon: "🪬",
          cost: 700,
          effects: [{ kind: "shieldedMissNoHPLoss" }],
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
          icon: "🧬",
          cost: 1800,
          effects: [{ kind: "ultimateUnlock", id: "restore" }],
        },
      ],
    },
  ],
};
