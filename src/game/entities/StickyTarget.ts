import { Target, type ClickResult, type TargetSpawn } from "./Target";
import {
  DEFAULT_TARGET_MODIFIERS,
  type TargetSpawnModifiers,
} from "../effects/EffectResolver";
import {
  STICKY_MAX_CLUSTER,
  STICKY_SCORE_PER_CLICK,
} from "../config/balance";

const CORE_COLOR = 0x0a3d3a;

export class StickyTarget extends Target {
  private clusterSize = 1;
  private clicksRemaining = 1;
  private radius: number;

  constructor(
    spawn: TargetSpawn,
    modifiers: TargetSpawnModifiers = DEFAULT_TARGET_MODIFIERS,
  ) {
    super("sticky", spawn, modifiers);
    this.radius = this.initialSize;
    this.spawn();
  }

  get cluster(): number {
    return this.clusterSize;
  }

  get clusterRadius(): number {
    return this.radius;
  }

  absorb(other: StickyTarget): void {
    const merged = Math.min(
      this.clusterSize + other.cluster,
      STICKY_MAX_CLUSTER,
    );
    this.clusterSize = merged;
    this.clicksRemaining = merged;
    this.radius = this.initialSize * Math.sqrt(merged);
    this.currentSize = this.radius;
    this.rebuildBase(this.radius);
    this.render();
    this.pulse();
  }

  render(): void {
    this.decoration.clear();
    if (this.clusterSize <= 1) return;

    const r = this.radius;
    for (let i = 0; i < this.clusterSize; i++) {
      const angle = (Math.PI * 2 * i) / this.clusterSize;
      this.decoration
        .circle(Math.cos(angle) * r * 0.5, Math.sin(angle) * r * 0.5, r * 0.4)
        .fill(CORE_COLOR);
    }
    const ratio = this.clicksRemaining / this.clusterSize;
    if (ratio > 0) {
      this.decoration
        .circle(0, 0, r * 0.55 * ratio)
        .stroke({ width: 5, color: 0xffffff });
    }
  }

  onClick(): ClickResult {
    this.clicksRemaining -= 1;
    if (this.clicksRemaining > 0) {
      this.render();
      this.pulse();
      return { destroyed: false, score: 0, effects: [] };
    }
    return {
      destroyed: true,
      score: STICKY_SCORE_PER_CLICK * this.clusterSize * this.scoreMul,
      effects: [],
    };
  }
}
