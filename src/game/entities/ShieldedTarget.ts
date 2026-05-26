import { Graphics } from "pixi.js";
import { Target, type ClickResult, type TargetSpawn } from "./Target";
import { tweenManager } from "../util/TweenManager";
import { easeOutCubic } from "../util/easings";
import { FEEL } from "../config/feel";
import {
  DEFAULT_TARGET_MODIFIERS,
  type TargetSpawnModifiers,
} from "../effects/EffectResolver";

const SHIELD_COLOR = 0x00f0ff;

export class ShieldedTarget extends Target {
  private shieldUp = true;

  constructor(
    spawn: TargetSpawn,
    modifiers: TargetSpawnModifiers = DEFAULT_TARGET_MODIFIERS,
  ) {
    super("shielded", spawn, modifiers);
    this.spawn();
  }

  get hasShield(): boolean {
    return this.shieldUp;
  }

  breakShield(): boolean {
    if (!this.shieldUp || !this.isInteractive) return false;
    this.shieldUp = false;
    this.render();
    this.spawnShards();
    this.pulse();
    return true;
  }

  render(): void {
    this.decoration.clear();
    if (!this.shieldUp) return;

    const r = this.initialSize * 1.4;
    const points: number[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI) / 3;
      points.push(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    this.decoration.poly(points).stroke({ width: 4, color: SHIELD_COLOR });
  }

  onClick(): ClickResult {
    if (this.shieldUp) {
      this.breakShield();
      return { destroyed: false, score: 0, effects: [] };
    }
    return {
      destroyed: true,
      score: this.config.score * this.scoreMul,
      effects: [],
    };
  }

  private spawnShards(): void {
    const parent = this.view.parent;
    if (parent === null) return;

    const r = this.initialSize * 1.4;
    for (let i = 0; i < FEEL.shieldShardCount; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / FEEL.shieldShardCount;
      const shard = new Graphics();
      shard.poly([0, -7, 9, 7, -9, 7]).fill(SHIELD_COLOR);
      shard.position.set(this.x, this.y);
      shard.rotation = angle;
      parent.addChild(shard);

      const distance = r * 1.8;
      const targetX = this.x + Math.cos(angle) * distance;
      const targetY = this.y + Math.sin(angle) * distance;

      tweenManager.to(
        0,
        1,
        FEEL.shieldShardMs,
        (p) => {
          shard.position.set(
            this.x + (targetX - this.x) * p,
            this.y + (targetY - this.y) * p,
          );
          shard.alpha = 1 - p;
        },
        easeOutCubic,
        () => {
          shard.removeFromParent();
          shard.destroy();
        },
      );
    }
  }
}
