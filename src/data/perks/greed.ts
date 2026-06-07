import type { SkillBranch } from "../skillTree";
import { TIER_REQUIRES_POINTS } from "../tier";

export const GREED_BRANCH: SkillBranch = {
  id: "greed",
  name: "Greed",
  description: "More risk, more reward, more shiny things.",
  color: "#ffd700",
  tiers: [
    {
      tier: 1,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[1],
      options: [
        {
          id: "greed-t1-score-boost",
          name: "Score Boost",
          description:
            "Every target awards 25% more score. Compounds with Greed Combo Climb and Survival Score Heal.",
          icon: "trending-up",
          cost: 50,
          effects: [{ kind: "scoreMul", value: 1.25 }],
        },
        {
          id: "greed-t1-reckless",
          name: "Reckless",
          description: "Clicking a bomb no longer resets your combo.",
          icon: "flame",
          cost: 80,
          effects: [{ kind: "comboNoResetOnBombClick" }],
        },
        {
          id: "greed-t1-high-stakes",
          name: "High Stakes",
          description:
            "A bomb-click still triggers its penalty, but first cashes out your combo: 2x a regular target's score at your current multiplier. Your combo then resets.",
          icon: "dice",
          cost: 100,
          effects: [{ kind: "bombComboCashout", scoreMul: 2 }],
        },
      ],
    },
    {
      tier: 2,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[2],
      options: [
        {
          id: "greed-t2-golden-rain",
          name: "Golden Rain",
          description: "Golden targets spawn 50% more often.",
          icon: "star",
          cost: 250,
          effects: [{ kind: "goldenSpawnRateMul", value: 1.5 }],
        },
        {
          id: "greed-t2-double-drops",
          name: "Double Drops",
          description: "10% chance a target spawns as a 2× score variant.",
          icon: "gem",
          cost: 300,
          effects: [{ kind: "doubleTargetChance", value: 0.1 }],
        },
        {
          id: "greed-t2-bomb-bounty",
          name: "Bomb Bounty",
          description:
            "15% chance an expiring bomb drops 2 currency. Pair with Beacon Bombs to never miss the drops.",
          icon: "coins",
          cost: 350,
          effects: [
            { kind: "bombExpireCurrencyChance", value: 0.15, amount: 2 },
          ],
        },
      ],
    },
    {
      tier: 3,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[3],
      options: [
        {
          id: "greed-t3-combo-climb",
          name: "Combo Climb",
          description:
            "Combo multiplier caps at ×8 instead of ×5. Higher cap = more milestones; pair with Survival Bandage for healing scaling.",
          icon: "stairs",
          cost: 600,
          effects: [{ kind: "comboCap", value: 8 }],
        },
        {
          id: "greed-t3-coin-combo",
          name: "Coin Combo",
          description: "While at combo 50+, every hit awards 2 currency.",
          icon: "coin",
          cost: 700,
          effects: [
            { kind: "currencyPerHitAtComboGte", combo: 50, amount: 2 },
          ],
        },
        {
          id: "greed-t3-speculation",
          name: "Speculation",
          description:
            "Each golden hit grants +10% score for 5 s (stacks to ×3). Any miss clears the stack. Pair with Golden Rain to feed the stack faster.",
          icon: "trending-up-2",
          cost: 700,
          effects: [
            {
              kind: "goldenScoreStack",
              perStackMul: 0.1,
              maxStacks: 3,
              durationMs: 5000,
            },
          ],
        },
      ],
    },
    {
      tier: 4,
      requiresPointsInBranch: TIER_REQUIRES_POINTS[4],
      options: [
        {
          id: "greed-t4-frenzy",
          name: "Frenzy",
          description:
            "Ultimate: 8 seconds where every hit spawns 2 extras nearby and score is ×2.",
          icon: "burst",
          cost: 2400,
          effects: [{ kind: "ultimateUnlock", id: "frenzy" }],
        },
      ],
    },
  ],
};
