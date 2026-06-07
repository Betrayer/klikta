import { describe, expect, it } from "vitest";
import { EffectResolver } from "./EffectResolver";
import type { SkillEffect } from "./types";

const resolver = (...effects: SkillEffect[]): EffectResolver =>
  new EffectResolver(effects);

describe("EffectResolver rebalance effects", () => {
  it("scoreCurrencyTradeoff feeds scoreMul and currencyMul (Mortgage)", () => {
    const mods = resolver({
      kind: "scoreCurrencyTradeoff",
      scoreMul: 1.5,
      currencyMul: 0.5,
    }).buildRunModifiers();
    expect(mods.scoreMul).toBeCloseTo(1.5);
    expect(mods.currencyMul).toBeCloseTo(0.5);
    expect(mods.currencyDisabled).toBe(false);
  });

  it("defaults currencyMul to 1 and bomb bounty amount to 1", () => {
    const mods = resolver().buildRunModifiers();
    expect(mods.currencyMul).toBe(1);
    expect(mods.bombExpireCurrencyAmount).toBe(1);
  });

  it("bombExpireCurrencyChance carries its amount (Bomb Bounty buff)", () => {
    const mods = resolver({
      kind: "bombExpireCurrencyChance",
      value: 0.15,
      amount: 2,
    }).buildRunModifiers();
    expect(mods.bombExpireCurrencyChance).toBeCloseTo(0.15);
    expect(mods.bombExpireCurrencyAmount).toBe(2);
  });

  it("goldenScoreStack maps to run modifiers (Speculation)", () => {
    const mods = resolver({
      kind: "goldenScoreStack",
      perStackMul: 0.1,
      maxStacks: 3,
      durationMs: 5000,
    }).buildRunModifiers();
    expect(mods.goldenScoreStack).toEqual({
      perStackMul: 0.1,
      maxStacks: 3,
      durationMs: 5000,
    });
  });

  it("hpHealAtComboMilestones maps to run modifiers (Bandage)", () => {
    const mods = resolver({
      kind: "hpHealAtComboMilestones",
      milestones: [50, 100],
      healAmount: 1,
    }).buildRunModifiers();
    expect(mods.comboHealMilestones?.healAmount).toBe(1);
    expect(mods.comboHealMilestones?.milestones).toEqual([50, 100]);
  });

  it("phoenixRevive maps to run modifiers (Phoenix)", () => {
    const mods = resolver({
      kind: "phoenixRevive",
      iframesMs: 3000,
    }).buildRunModifiers();
    expect(mods.phoenix).toEqual({ iframesMs: 3000 });
  });

  it("chainHit maps to run modifiers (Spark)", () => {
    const mods = resolver({
      kind: "chainHit",
      triggerChance: 0.07,
      maxHops: 7,
      radiusMul: 1.5,
    }).buildRunModifiers();
    expect(mods.chainHit).toEqual({
      triggerChance: 0.07,
      maxHops: 7,
      radiusMul: 1.5,
    });
  });

  it("lastStandAtLowHp maps to run modifiers (Last Stand)", () => {
    const mods = resolver({
      kind: "lastStandAtLowHp",
      scoreMul: 3,
      lifetimeMul: 0.8,
    }).buildRunModifiers();
    expect(mods.lastStand).toEqual({ scoreMul: 3, lifetimeMul: 0.8 });
  });

  it("vortexOrbitSpeed maps to run modifiers (Vortex)", () => {
    const mods = resolver({
      kind: "vortexOrbitSpeed",
      radPerSec: 0.78,
    }).buildRunModifiers();
    expect(mods.vortexRadPerSec).toBeCloseTo(0.78);
  });

  it("bombSpawnZone edge flips the spawn policy (Steady Bombs)", () => {
    const policy = resolver({
      kind: "bombSpawnZone",
      zone: "edge",
    }).buildSpawnPolicy();
    expect(policy.bombEdgeOnly).toBe(true);
  });

  it("mirrorSpawn carries bombTwinChance (Mirror Spawn nerf)", () => {
    const policy = resolver({
      kind: "mirrorSpawn",
      bombTwinChance: 0.1,
    }).buildSpawnPolicy();
    expect(policy.mirrorSpawn).toBe(true);
    expect(policy.mirrorBombTwinChance).toBeCloseTo(0.1);
  });

  it("spawnRateSurge carries comboProtected (Rush Pulse)", () => {
    const policy = resolver({
      kind: "spawnRateSurgeEveryMs",
      period: 30000,
      durationMs: 5000,
      mul: 3,
      comboProtected: true,
    }).buildSpawnPolicy();
    expect(policy.spawnRateSurge?.comboProtected).toBe(true);
  });

  it("lastChanceMs maps to base target modifiers (Last Chance)", () => {
    const mods = resolver({
      kind: "lastChanceMs",
      value: 300,
    }).buildBaseTargetModifiers();
    expect(mods.lastChanceMs).toBe(300);
  });

  it("oversizeChance with sizeMul < 1 survives (Greedy Spawn)", () => {
    const policy = resolver({
      kind: "oversizeChance",
      value: 0.2,
      sizeMul: 0.6,
      scoreMul: 2,
    }).buildSpawnPolicy();
    expect(policy.oversizeChance).toBeCloseTo(0.2);
    expect(policy.oversizeSizeMul).toBeCloseTo(0.6);
    expect(policy.oversizeScoreMul).toBeCloseTo(2);
  });
});
