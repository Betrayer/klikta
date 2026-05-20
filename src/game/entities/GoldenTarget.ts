import { Target, type ClickResult, type TargetSpawn } from "./Target";
import {
  DEFAULT_TARGET_MODIFIERS,
  type TargetSpawnModifiers,
} from "../effects/EffectResolver";

export class GoldenTarget extends Target {
  constructor(
    spawn: TargetSpawn,
    modifiers: TargetSpawnModifiers = DEFAULT_TARGET_MODIFIERS,
  ) {
    super("golden", spawn, modifiers);
    this.spawn();
  }

  render(): void {
    this.graphics.clear();
    this.graphics.circle(0, 0, this.initialSize).fill(this.config.color);
    this.graphics
      .circle(0, 0, this.initialSize * 0.55)
      .stroke({ width: 4, color: 0xffffff });
  }

  onClick(): ClickResult {
    return {
      destroyed: true,
      score: this.config.score * this.scoreMul,
      effects: [],
    };
  }
}
