import { TARGET_CONFIG, type TargetKind } from "../../data/targetConfig";
import {
  DEFAULT_SPAWN_POLICY,
  DEFAULT_TARGET_MODIFIERS,
  type SpawnPolicy,
  type TargetSpawnModifiers,
} from "../effects/EffectResolver";

export interface SpawnBounds {
  width: number;
  height: number;
}

export interface SpawnEvent {
  x: number;
  y: number;
  kind: TargetKind;
  modifiers: TargetSpawnModifiers;
  appearAsGolden: boolean;
  multiClicksOverride: number | null;
  pairWithNext: boolean;
}

const INITIAL_INTERVAL_MS = 1500;
const EDGE_MARGIN = 0.1;
const DECAY_EVERY_MS = 10_000;
const DECAY_FACTOR = 0.95;
const MIN_INTERVAL_MS = 300;
const EVERY_FIFTH_BOMB_AT = 5;

const KINDS = Object.keys(TARGET_CONFIG) as TargetKind[];

export class SpawnSystem {
  private spawnIntervalMs = INITIAL_INTERVAL_MS;
  private nextSpawnAt: number;
  private nextDecayAt: number;
  private readonly startTimeMs: number;
  private readonly policy: SpawnPolicy;
  private readonly baseModifiers: TargetSpawnModifiers;
  private readonly goldenLifetimeMul: number;
  private readonly multiClicksOverride: number | null;
  private targetCounter = 0;

  constructor(
    startTimeMs: number,
    policy: SpawnPolicy = DEFAULT_SPAWN_POLICY,
    baseModifiers: TargetSpawnModifiers = DEFAULT_TARGET_MODIFIERS,
    goldenLifetimeMul = 1,
    multiClicksOverride: number | null = null,
  ) {
    this.startTimeMs = startTimeMs;
    this.policy = policy;
    this.baseModifiers = baseModifiers;
    this.goldenLifetimeMul = goldenLifetimeMul;
    this.multiClicksOverride = multiClicksOverride;
    this.nextSpawnAt = startTimeMs + this.spawnIntervalMs;
    this.nextDecayAt = startTimeMs + DECAY_EVERY_MS;
  }

  tick(currentTimeMs: number, bounds: SpawnBounds): SpawnEvent[] {
    if (currentTimeMs >= this.nextDecayAt) {
      this.spawnIntervalMs = Math.max(
        this.spawnIntervalMs * DECAY_FACTOR,
        MIN_INTERVAL_MS,
      );
      this.nextDecayAt += DECAY_EVERY_MS;
    }

    if (currentTimeMs < this.nextSpawnAt) return [];
    const surgeMul = this.surgeMul(currentTimeMs);
    this.nextSpawnAt = currentTimeMs + this.spawnIntervalMs / surgeMul;

    this.targetCounter += 1;
    const forcedBomb =
      this.policy.everyFifthBomb &&
      this.targetCounter % EVERY_FIFTH_BOMB_AT === 0;

    const kind = forcedBomb ? "bomb" : this.pickKind();
    const event = this.buildEvent(kind, bounds, this.policy.mirrorSpawn);
    if (!this.policy.mirrorSpawn) return [event];

    const mirror = this.buildMirror(event, bounds);
    return [event, mirror];
  }

  private surgeMul(currentTimeMs: number): number {
    const surge = this.policy.spawnRateSurge;
    if (surge === null) return 1;
    const elapsed = currentTimeMs - this.startTimeMs;
    if (elapsed < surge.periodMs) return 1;
    const phase = elapsed % surge.periodMs;
    return phase < surge.durationMs ? surge.mul : 1;
  }

  private pickKind(): TargetKind {
    const weights: Record<TargetKind, number> = {
      regular: TARGET_CONFIG.regular.spawnWeight,
      golden:
        TARGET_CONFIG.golden.spawnWeight * this.policy.goldenSpawnWeightMul,
      bomb: TARGET_CONFIG.bomb.spawnWeight * this.policy.bombSpawnWeightMul,
      multi: TARGET_CONFIG.multi.spawnWeight,
      shielded: TARGET_CONFIG.shielded.spawnWeight,
    };

    let total = 0;
    for (const k of KINDS) total += weights[k];

    let roll = Math.random() * total;
    for (const k of KINDS) {
      roll -= weights[k];
      if (roll < 0) return k;
    }
    return "regular";
  }

  private buildEvent(
    kind: TargetKind,
    bounds: SpawnBounds,
    pairWithNext: boolean,
  ): SpawnEvent {
    const marginX = bounds.width * EDGE_MARGIN;
    const marginY = bounds.height * EDGE_MARGIN;
    const x = marginX + Math.random() * (bounds.width - marginX * 2);
    const y = marginY + Math.random() * (bounds.height - marginY * 2);

    return {
      x,
      y,
      kind,
      modifiers: this.deriveModifiers(kind),
      appearAsGolden:
        kind === "bomb" && Math.random() < this.policy.bombDecoyChance,
      multiClicksOverride: kind === "multi" ? this.multiClicksOverride : null,
      pairWithNext,
    };
  }

  private buildMirror(source: SpawnEvent, bounds: SpawnBounds): SpawnEvent {
    return {
      ...source,
      x: bounds.width - source.x,
      y: bounds.height - source.y,
      pairWithNext: false,
    };
  }

  private deriveModifiers(kind: TargetKind): TargetSpawnModifiers {
    let lifetimeMul = this.baseModifiers.lifetimeMul;
    let sizeMul = this.baseModifiers.sizeMul;
    let scoreMul = this.baseModifiers.scoreMul;

    if (kind === "golden") lifetimeMul *= this.goldenLifetimeMul;

    const jitter = this.policy.lifetimeJitterPct;
    if (jitter > 0) {
      lifetimeMul *= 1 + (Math.random() - 0.5) * 2 * jitter;
    }

    if (kind !== "bomb") {
      if (Math.random() < this.policy.oversizeChance) {
        sizeMul *= this.policy.oversizeSizeMul;
        scoreMul *= this.policy.oversizeScoreMul;
      }
      if (Math.random() < this.policy.doubleTargetChance) {
        scoreMul *= this.policy.doubleTargetScoreMul;
      }
    }

    return {
      ...this.baseModifiers,
      lifetimeMul,
      sizeMul,
      scoreMul,
    };
  }
}
