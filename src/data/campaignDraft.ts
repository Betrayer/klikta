import type { SkillEffect } from "../game/effects/types";
import type { DraftTier } from "../game/modes/ModePolicy";
import { SKILL_TREE, type SkillOption } from "./skillTree";

export interface DraftChoice {
  id: string;
  name: string;
  description: string;
  effects: readonly SkillEffect[];
}

const toChoice = (option: SkillOption): DraftChoice => ({
  id: option.id,
  name: option.name,
  description: option.description,
  effects: option.effects,
});

const shuffled = <T>(items: readonly T[]): T[] => {
  const source = [...items];
  for (let i = source.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = source[i];
    const b = source[j];
    if (a !== undefined && b !== undefined) {
      source[i] = b;
      source[j] = a;
    }
  }
  return source;
};

const isUltimateOption = (option: SkillOption): boolean =>
  option.effects.some((e) => e.kind === "ultimateUnlock");

const optionsAtTier = (tier: number): SkillOption[] => {
  const out: SkillOption[] = [];
  for (const branch of SKILL_TREE) {
    for (const t of branch.tiers) {
      if (t.tier !== tier) continue;
      out.push(...t.options);
    }
  }
  return out;
};

const pick = (
  all: readonly SkillOption[],
  usedIds: readonly string[],
  count: number,
): DraftChoice[] => {
  const pool = all.filter((o) => !usedIds.includes(o.id));
  const source = pool.length >= count ? pool : all;
  return shuffled(source)
    .slice(0, count)
    .map(toChoice);
};

export const rollPerkChoices = (
  tier: DraftTier,
  usedIds: readonly string[],
  count = 3,
): DraftChoice[] =>
  pick(optionsAtTier(tier).filter((o) => !isUltimateOption(o)), usedIds, count);

export const rollUltimateChoices = (
  usedIds: readonly string[],
  count = 2,
): DraftChoice[] => pick(optionsAtTier(4).filter(isUltimateOption), usedIds, count);
