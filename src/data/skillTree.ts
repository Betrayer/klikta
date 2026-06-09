import type { SkillEffect } from "../game/effects/types";
import { REACTION_BRANCH } from "./perks/reaction";
import { GREED_BRANCH } from "./perks/greed";
import { SURVIVAL_BRANCH } from "./perks/survival";
import { WILD_BRANCH } from "./perks/wild";
import { MUTATION_BRANCH } from "./perks/mutation";
import { TIER_REQUIRES_POINTS } from "./tier";
import type { TierLevel } from "./tier";

export type BranchId = "reaction" | "greed" | "survival" | "wild" | "mutation";
export type { TierLevel };

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

export const findUltimateForBranch = (
  branchId: BranchId,
): { id: string; name: string } | undefined => {
  const branch = SKILL_TREE.find((b) => b.id === branchId);
  if (branch === undefined) return undefined;
  for (const tier of branch.tiers) {
    if (tier.tier !== 4) continue;
    for (const option of tier.options) {
      for (const effect of option.effects) {
        if (effect.kind === "ultimateUnlock") {
          return { id: effect.id, name: option.name };
        }
      }
    }
  }
  return undefined;
};

export interface UltimateSlotInfo {
  branchId: BranchId;
  branchIndex: number;
  color: string;
  perkId: string;
  name: string;
}

export const findUltimateSlot = (
  ultimateId: string,
): UltimateSlotInfo | undefined => {
  for (let branchIndex = 0; branchIndex < SKILL_TREE.length; branchIndex++) {
    const branch = SKILL_TREE[branchIndex];
    if (branch === undefined) continue;
    for (const tier of branch.tiers) {
      if (tier.tier !== 4) continue;
      for (const option of tier.options) {
        for (const effect of option.effects) {
          if (effect.kind === "ultimateUnlock" && effect.id === ultimateId) {
            return {
              branchId: branch.id,
              branchIndex,
              color: branch.color,
              perkId: option.id,
              name: option.name,
            };
          }
        }
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
