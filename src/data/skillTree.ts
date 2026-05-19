import type { SkillEffect } from "../game/effects/types";
import { REACTION_BRANCH } from "./perks/reaction";
import { GREED_BRANCH } from "./perks/greed";
import { SURVIVAL_BRANCH } from "./perks/survival";
import { WILD_BRANCH } from "./perks/wild";
import { MUTATION_BRANCH } from "./perks/mutation";

export type BranchId = "reaction" | "greed" | "survival" | "wild" | "mutation";

export type TierLevel = 1 | 2 | 3 | 4;

export interface SkillOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  effects: readonly SkillEffect[];
  cost: number;
}

export interface SkillTier {
  tier: TierLevel;
  requiresPointsInBranch: number;
  options: readonly SkillOption[];
}

export interface SkillBranch {
  id: BranchId;
  name: string;
  description: string;
  color: string;
  tiers: readonly SkillTier[];
}

export const TIER_REQUIRES_POINTS: Readonly<Record<TierLevel, number>> = {
  1: 0,
  2: 1,
  3: 2,
  4: 3,
};

export const tierKey = (branchId: BranchId, tier: TierLevel): string =>
  `${branchId}-t${tier}`;

export const SKILL_TREE: readonly SkillBranch[] = [
  REACTION_BRANCH,
  GREED_BRANCH,
  SURVIVAL_BRANCH,
  WILD_BRANCH,
  MUTATION_BRANCH,
];

export const findPerk = (perkId: string): SkillOption | undefined => {
  for (const branch of SKILL_TREE) {
    for (const tier of branch.tiers) {
      for (const option of tier.options) {
        if (option.id === perkId) return option;
      }
    }
  }
  return undefined;
};

export const findTierForPerk = (
  perkId: string,
): { branch: SkillBranch; tier: SkillTier } | undefined => {
  for (const branch of SKILL_TREE) {
    for (const tier of branch.tiers) {
      if (tier.options.some((o) => o.id === perkId)) {
        return { branch, tier };
      }
    }
  }
  return undefined;
};

const validateSkillTree = (): void => {
  const seenIds = new Set<string>();
  const ultimateIds = new Set<string>();
  for (const branch of SKILL_TREE) {
    const tierLevels = new Set<TierLevel>();
    for (const tier of branch.tiers) {
      if (tierLevels.has(tier.tier)) {
        throw new Error(
          `[skillTree] branch ${branch.id} has duplicate tier ${tier.tier}`,
        );
      }
      tierLevels.add(tier.tier);
      const expectedGate = TIER_REQUIRES_POINTS[tier.tier];
      if (tier.requiresPointsInBranch !== expectedGate) {
        throw new Error(
          `[skillTree] branch ${branch.id} tier ${tier.tier} gate ${tier.requiresPointsInBranch} != expected ${expectedGate}`,
        );
      }
      if (tier.options.length === 0) {
        throw new Error(
          `[skillTree] branch ${branch.id} tier ${tier.tier} has no options`,
        );
      }
      for (const option of tier.options) {
        if (seenIds.has(option.id)) {
          throw new Error(`[skillTree] duplicate perk id ${option.id}`);
        }
        seenIds.add(option.id);
        if (option.effects.length === 0) {
          throw new Error(`[skillTree] perk ${option.id} has no effects`);
        }
        if (option.cost < 0) {
          throw new Error(`[skillTree] perk ${option.id} has negative cost`);
        }
        for (const effect of option.effects) {
          if (effect.kind === "ultimateUnlock") {
            if (tier.tier !== 4) {
              throw new Error(
                `[skillTree] ultimateUnlock perk ${option.id} not in T4`,
              );
            }
            if (ultimateIds.has(effect.id)) {
              throw new Error(`[skillTree] duplicate ultimate id ${effect.id}`);
            }
            ultimateIds.add(effect.id);
          }
        }
      }
    }
    for (const level of [1, 2, 3, 4] as const) {
      if (!tierLevels.has(level)) {
        throw new Error(
          `[skillTree] branch ${branch.id} missing tier ${level}`,
        );
      }
    }
  }
};

validateSkillTree();
