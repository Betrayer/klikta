import type { SkillEffect } from "../game/effects/types";

export interface RunPerk {
  id: string;
  name: string;
  description: string;
  effects: readonly SkillEffect[];
}

const RUN_PERKS: readonly RunPerk[] = [
  {
    id: "rp-overdrive",
    name: "Overdrive",
    description: "+25% score for the rest of the run.",
    effects: [{ kind: "scoreMul", value: 1.25 }],
  },
  {
    id: "rp-medic",
    name: "Field Medic",
    description: "+1 max HP and heal 1.",
    effects: [{ kind: "startingHPAdd", value: 1 }],
  },
  {
    id: "rp-slowmo",
    name: "Slow Motion",
    description: "+20% target lifetime.",
    effects: [{ kind: "targetLifetimeMul", value: 1.2 }],
  },
  {
    id: "rp-bigtargets",
    name: "Big Targets",
    description: "+18% target size.",
    effects: [{ kind: "targetSizeMul", value: 1.18 }],
  },
  {
    id: "rp-momentum",
    name: "Momentum",
    description: "Raise combo multiplier cap to 7.",
    effects: [{ kind: "comboCap", value: 7 }],
  },
  {
    id: "rp-goldrush",
    name: "Gold Rush",
    description: "Golden targets appear twice as often.",
    effects: [{ kind: "goldenSpawnRateMul", value: 2 }],
  },
  {
    id: "rp-regen",
    name: "Regeneration",
    description: "Heal 1 HP per 1000 score.",
    effects: [{ kind: "hpRegenPer1000Score", value: 1 }],
  },
  {
    id: "rp-toughskin",
    name: "Tough Skin",
    description: "Brief invulnerability after taking damage.",
    effects: [{ kind: "damageIframesMs", value: 800 }],
  },
  {
    id: "rp-defuser",
    name: "Defuser",
    description: "Bomb clicks after the first cost no HP.",
    effects: [{ kind: "bombClickFreeAfterFirst" }],
  },
  {
    id: "rp-echo",
    name: "Echo",
    description: "Hits leave a bonus phantom worth extra score.",
    effects: [{ kind: "echoPhantomMs", duration: 1500, bonusMul: 1.5 }],
  },
];

export const rollRunPerkChoices = (
  usedIds: readonly string[],
  count = 3,
): RunPerk[] => {
  const pool = RUN_PERKS.filter((p) => !usedIds.includes(p.id));
  const source = pool.length >= count ? [...pool] : [...RUN_PERKS];
  for (let i = source.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = source[i];
    const b = source[j];
    if (a !== undefined && b !== undefined) {
      source[i] = b;
      source[j] = a;
    }
  }
  return source.slice(0, count);
};
