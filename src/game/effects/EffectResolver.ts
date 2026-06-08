import type { SkillEffect } from "./types";
import { SKILL_TREE, tierKey } from "../../data/skillTree";

export interface RunModifiers {
  readonly startingHPAdd: number;
  readonly comboCap: number;
  readonly scoreMul: number;
  readonly currencyDisabled: boolean;
  readonly multiClicksOverride: number | null;
  readonly comboNoResetOnBombClick: boolean;
  readonly bombComboCashout: number;
  readonly bombClickFreeAfterFirst: boolean;
  readonly firstMissForgiven: boolean;
  readonly damageIframesMs: number;
  readonly backgroundClickIgnored: boolean;
  readonly shieldedMissNoHPLoss: boolean;
  readonly shieldedShieldBreaksOnMiss: boolean;
  readonly hpRegenPer1000Score: number;
  readonly bombExpireCurrencyChance: number;
  readonly bombExpireCurrencyAmount: number;
  readonly currencyMul: number;
  readonly currencyPerHit: { combo: number; amount: number } | null;
  readonly echoPhantom: { durationMs: number; bonusMul: number } | null;
  readonly goldenScoreStack: {
    perStackMul: number;
    maxStacks: number;
    durationMs: number;
  } | null;
  readonly comboHealMilestones: {
    milestones: readonly number[];
    healAmount: number;
  } | null;
  readonly phoenix: { iframesMs: number } | null;
  readonly chainHit: {
    triggerChance: number;
    maxHops: number;
    radiusMul: number;
  } | null;
  readonly lastStand: { scoreMul: number; lifetimeMul: number } | null;
  readonly vortexRadPerSec: number;
}

export interface TargetSpawnModifiers {
  readonly lifetimeMul: number;
  readonly sizeMul: number;
  readonly scoreMul: number;
  readonly spawnAnimMul: number;
  readonly lastChanceMs: number;
  readonly slowBloomPhaseMs: number;
  readonly convergentDriftSpeed: number;
  readonly magnetSpeed: number;
  readonly phaseFlash: {
    periodMs: number;
    invisibleMs: number;
    bonusMul: number;
  } | null;
  readonly beaconBombGrowToScale: number | null;
  readonly bombBlinkFasterEndMs: number;
}

export interface SpawnPolicy {
  readonly goldenSpawnWeightMul: number;
  readonly bombSpawnWeightMul: number;
  readonly everyFifthBomb: boolean;
  readonly lifetimeJitterPct: number;
  readonly oversizeChance: number;
  readonly oversizeSizeMul: number;
  readonly oversizeScoreMul: number;
  readonly bombDecoyChance: number;
  readonly doubleTargetChance: number;
  readonly doubleTargetScoreMul: number;
  readonly mirrorSpawn: boolean;
  readonly mirrorBombTwinChance: number;
  readonly bombEdgeOnly: boolean;
  readonly spawnRateSurge: {
    periodMs: number;
    durationMs: number;
    mul: number;
    comboProtected: boolean;
  } | null;
  readonly timePulse: { periodMs: number; durationMs: number } | null;
}

const DEFAULT_RUN_MODIFIERS: RunModifiers = {
  startingHPAdd: 0,
  comboCap: 5,
  scoreMul: 1,
  currencyDisabled: false,
  multiClicksOverride: null,
  comboNoResetOnBombClick: false,
  bombComboCashout: 0,
  bombClickFreeAfterFirst: false,
  firstMissForgiven: false,
  damageIframesMs: 0,
  backgroundClickIgnored: false,
  shieldedMissNoHPLoss: false,
  shieldedShieldBreaksOnMiss: false,
  hpRegenPer1000Score: 0,
  bombExpireCurrencyChance: 0,
  bombExpireCurrencyAmount: 1,
  currencyMul: 1,
  currencyPerHit: null,
  echoPhantom: null,
  goldenScoreStack: null,
  comboHealMilestones: null,
  phoenix: null,
  chainHit: null,
  lastStand: null,
  vortexRadPerSec: 0,
};

export const DEFAULT_TARGET_MODIFIERS: TargetSpawnModifiers = {
  lifetimeMul: 1,
  sizeMul: 1,
  scoreMul: 1,
  spawnAnimMul: 1,
  lastChanceMs: 0,
  slowBloomPhaseMs: 0,
  convergentDriftSpeed: 0,
  magnetSpeed: 0,
  phaseFlash: null,
  beaconBombGrowToScale: null,
  bombBlinkFasterEndMs: 0,
};

export const DEFAULT_SPAWN_POLICY: SpawnPolicy = {
  goldenSpawnWeightMul: 1,
  bombSpawnWeightMul: 1,
  everyFifthBomb: false,
  lifetimeJitterPct: 0,
  oversizeChance: 0,
  oversizeSizeMul: 1,
  oversizeScoreMul: 1,
  bombDecoyChance: 0,
  doubleTargetChance: 0,
  doubleTargetScoreMul: 2,
  mirrorSpawn: false,
  mirrorBombTwinChance: 0,
  bombEdgeOnly: false,
  spawnRateSurge: null,
  timePulse: null,
};

export class EffectResolver {
  private readonly effects: readonly SkillEffect[];

  static fromMetaSnapshot(
    selectedPerks: Record<string, string>,
  ): EffectResolver {
    const list: SkillEffect[] = [];
    for (const branch of SKILL_TREE) {
      for (const tier of branch.tiers) {
        const id = selectedPerks[tierKey(branch.id, tier.tier)];
        if (id === undefined) continue;
        const option = tier.options.find((o) => o.id === id);
        if (option === undefined) continue;
        for (const eff of option.effects) list.push(eff);
      }
    }
    return new EffectResolver(list);
  }

  static empty(): EffectResolver {
    return new EffectResolver([]);
  }

  constructor(effects: readonly SkillEffect[]) {
    this.effects = effects;
  }

  extend(extra: readonly SkillEffect[]): EffectResolver {
    if (extra.length === 0) return this;
    return new EffectResolver([...this.effects, ...extra]);
  }

  buildRunModifiers(): RunModifiers {
    let scoreMul = 1;
    let comboCap = DEFAULT_RUN_MODIFIERS.comboCap;
    let startingHPAdd = 0;
    let currencyDisabled = false;
    let multiClicksOverride: number | null = null;
    let comboNoResetOnBombClick = false;
    let bombComboCashout = 0;
    let bombClickFreeAfterFirst = false;
    let firstMissForgiven = false;
    let damageIframesMs = 0;
    let backgroundClickIgnored = false;
    let shieldedMissNoHPLoss = false;
    let shieldedShieldBreaksOnMiss = false;
    let hpRegenPer1000Score = 0;
    let bombExpireCurrencyChance = 0;
    let bombExpireCurrencyAmount = 1;
    let currencyMul = 1;
    let currencyPerHit: { combo: number; amount: number } | null = null;
    let echoPhantom: RunModifiers["echoPhantom"] = null;
    let goldenScoreStack: RunModifiers["goldenScoreStack"] = null;
    let comboHealMilestones: RunModifiers["comboHealMilestones"] = null;
    let phoenix: RunModifiers["phoenix"] = null;
    let chainHit: RunModifiers["chainHit"] = null;
    let lastStand: RunModifiers["lastStand"] = null;
    let vortexRadPerSec = 0;

    for (const eff of this.effects) {
      switch (eff.kind) {
        case "scoreMul":
          scoreMul *= eff.value;
          break;
        case "scoreDoubledNoCurrency":
          scoreMul *= 2;
          currencyDisabled = true;
          break;
        case "scoreCurrencyTradeoff":
          scoreMul *= eff.scoreMul;
          currencyMul *= eff.currencyMul;
          break;
        case "comboCap":
          comboCap = Math.max(comboCap, eff.value);
          break;
        case "startingHPAdd":
          startingHPAdd += eff.value;
          break;
        case "multiClicksRequired":
          multiClicksOverride = eff.value;
          break;
        case "comboNoResetOnBombClick":
          comboNoResetOnBombClick = true;
          break;
        case "bombComboCashout":
          bombComboCashout = Math.max(bombComboCashout, eff.scoreMul);
          break;
        case "bombClickFreeAfterFirst":
          bombClickFreeAfterFirst = true;
          break;
        case "firstMissForgiven":
          firstMissForgiven = true;
          break;
        case "damageIframesMs":
          damageIframesMs = Math.max(damageIframesMs, eff.value);
          break;
        case "backgroundClickIgnored":
          backgroundClickIgnored = true;
          break;
        case "shieldedMissNoHPLoss":
          shieldedMissNoHPLoss = true;
          break;
        case "shieldedShieldBreaksOnMiss":
          shieldedShieldBreaksOnMiss = true;
          break;
        case "hpRegenPer1000Score":
          hpRegenPer1000Score = Math.max(hpRegenPer1000Score, eff.value);
          break;
        case "bombExpireCurrencyChance":
          if (eff.value > bombExpireCurrencyChance) {
            bombExpireCurrencyChance = eff.value;
          }
          bombExpireCurrencyAmount = Math.max(
            bombExpireCurrencyAmount,
            eff.amount ?? 1,
          );
          break;
        case "currencyPerHitAtComboGte":
          currencyPerHit = { combo: eff.combo, amount: eff.amount };
          break;
        case "echoPhantomMs":
          echoPhantom = { durationMs: eff.duration, bonusMul: eff.bonusMul };
          break;
        case "goldenScoreStack":
          goldenScoreStack = {
            perStackMul: eff.perStackMul,
            maxStacks: eff.maxStacks,
            durationMs: eff.durationMs,
          };
          break;
        case "hpHealAtComboMilestones":
          comboHealMilestones = {
            milestones: eff.milestones,
            healAmount: eff.healAmount,
          };
          break;
        case "phoenixRevive":
          phoenix = { iframesMs: eff.iframesMs };
          break;
        case "chainHit":
          chainHit = {
            triggerChance: eff.triggerChance,
            maxHops: eff.maxHops,
            radiusMul: eff.radiusMul,
          };
          break;
        case "lastStandAtLowHp":
          lastStand = { scoreMul: eff.scoreMul, lifetimeMul: eff.lifetimeMul };
          break;
        case "vortexOrbitSpeed":
          vortexRadPerSec = Math.max(vortexRadPerSec, eff.radPerSec);
          break;
        default:
          break;
      }
    }

    return {
      scoreMul,
      comboCap,
      startingHPAdd,
      currencyDisabled,
      multiClicksOverride,
      comboNoResetOnBombClick,
      bombComboCashout,
      bombClickFreeAfterFirst,
      firstMissForgiven,
      damageIframesMs,
      backgroundClickIgnored,
      shieldedMissNoHPLoss,
      shieldedShieldBreaksOnMiss,
      hpRegenPer1000Score,
      bombExpireCurrencyChance,
      bombExpireCurrencyAmount,
      currencyMul,
      currencyPerHit,
      echoPhantom,
      goldenScoreStack,
      comboHealMilestones,
      phoenix,
      chainHit,
      lastStand,
      vortexRadPerSec,
    };
  }

  buildSpawnPolicy(): SpawnPolicy {
    let goldenSpawnWeightMul = 1;
    let bombSpawnWeightMul = 1;
    let everyFifthBomb = false;
    let lifetimeJitterPct = 0;
    let oversizeChance = 0;
    let oversizeSizeMul = 1;
    let oversizeScoreMul = 1;
    let bombDecoyChance = 0;
    let doubleTargetChance = 0;
    const doubleTargetScoreMul = 2;
    let mirrorSpawn = false;
    let mirrorBombTwinChance = 0;
    let bombEdgeOnly = false;
    let spawnRateSurge: SpawnPolicy["spawnRateSurge"] = null;
    let timePulse: SpawnPolicy["timePulse"] = null;

    for (const eff of this.effects) {
      switch (eff.kind) {
        case "goldenSpawnRateMul":
          goldenSpawnWeightMul *= eff.value;
          break;
        case "bombWeightHalvedEveryFifthBomb":
          bombSpawnWeightMul *= 0.5;
          everyFifthBomb = true;
          break;
        case "lifetimeJitterPct":
          lifetimeJitterPct = Math.max(lifetimeJitterPct, eff.value);
          break;
        case "oversizeChance":
          if (eff.value >= oversizeChance) {
            oversizeChance = eff.value;
            oversizeSizeMul = eff.sizeMul;
            oversizeScoreMul = eff.scoreMul;
          }
          break;
        case "bombDecoyChance":
          bombDecoyChance = Math.max(bombDecoyChance, eff.value);
          break;
        case "doubleTargetChance":
          doubleTargetChance = Math.max(doubleTargetChance, eff.value);
          break;
        case "mirrorSpawn":
          mirrorSpawn = true;
          mirrorBombTwinChance = Math.max(
            mirrorBombTwinChance,
            eff.bombTwinChance ?? 0,
          );
          break;
        case "bombSpawnZone":
          if (eff.zone === "edge") bombEdgeOnly = true;
          break;
        case "spawnRateSurgeEveryMs":
          spawnRateSurge = {
            periodMs: eff.period,
            durationMs: eff.durationMs,
            mul: eff.mul,
            comboProtected: eff.comboProtected ?? false,
          };
          break;
        case "timePulse":
          timePulse = { periodMs: eff.periodMs, durationMs: eff.durationMs };
          break;
        default:
          break;
      }
    }

    return {
      goldenSpawnWeightMul,
      bombSpawnWeightMul,
      everyFifthBomb,
      lifetimeJitterPct,
      oversizeChance,
      oversizeSizeMul,
      oversizeScoreMul,
      bombDecoyChance,
      doubleTargetChance,
      doubleTargetScoreMul,
      mirrorSpawn,
      mirrorBombTwinChance,
      bombEdgeOnly,
      spawnRateSurge,
      timePulse,
    };
  }

  buildBaseTargetModifiers(): TargetSpawnModifiers {
    let lifetimeMul = 1;
    let sizeMul = 1;
    let spawnAnimMul = 1;
    let lastChanceMs = 0;
    let slowBloomPhaseMs = 0;
    let convergentDriftSpeed = 0;
    let magnetSpeed = 0;
    let phaseFlash: TargetSpawnModifiers["phaseFlash"] = null;
    let beaconBombGrowToScale: number | null = null;
    let bombBlinkFasterEndMs = 0;

    for (const eff of this.effects) {
      switch (eff.kind) {
        case "targetLifetimeMul":
          lifetimeMul *= eff.value;
          break;
        case "targetSizeMul":
          sizeMul *= eff.value;
          break;
        case "spawnAnimMul":
          spawnAnimMul = Math.max(spawnAnimMul, eff.value);
          break;
        case "lastChanceMs":
          lastChanceMs = Math.max(lastChanceMs, eff.value);
          break;
        case "slowBloomPhaseMs":
          slowBloomPhaseMs = Math.max(slowBloomPhaseMs, eff.value);
          break;
        case "convergentDriftSpeed":
          convergentDriftSpeed = Math.max(convergentDriftSpeed, eff.value);
          break;
        case "magnetSpeed":
          magnetSpeed += eff.value;
          break;
        case "targetsFollowCursorSpeed":
          magnetSpeed += eff.value;
          break;
        case "phaseFlashCycle":
          phaseFlash = {
            periodMs: eff.periodMs,
            invisibleMs: eff.invisibleMs,
            bonusMul: eff.bonusMul,
          };
          break;
        case "beaconBombs":
          beaconBombGrowToScale = Math.max(
            beaconBombGrowToScale ?? 1,
            eff.growToScale,
          );
          break;
        case "bombBlinkFasterEndS":
          bombBlinkFasterEndMs = Math.max(
            bombBlinkFasterEndMs,
            eff.value * 1000,
          );
          break;
        default:
          break;
      }
    }

    return {
      lifetimeMul,
      sizeMul,
      scoreMul: 1,
      spawnAnimMul,
      lastChanceMs,
      slowBloomPhaseMs,
      convergentDriftSpeed,
      magnetSpeed,
      phaseFlash,
      beaconBombGrowToScale,
      bombBlinkFasterEndMs,
    };
  }

  goldenLifetimeMul(): number {
    let mul = 1;
    for (const eff of this.effects) {
      if (eff.kind === "goldenLifetimeMul") mul *= eff.value;
    }
    return mul;
  }

  getUltimateUnlocks(): readonly string[] {
    const ids: string[] = [];
    for (const eff of this.effects) {
      if (eff.kind === "ultimateUnlock") ids.push(eff.id);
    }
    return ids;
  }
}
