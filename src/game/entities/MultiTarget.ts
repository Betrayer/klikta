import { Target, type ClickResult, type TargetSpawn } from "./Target";
import {
  DEFAULT_TARGET_MODIFIERS,
  type TargetSpawnModifiers,
} from "../effects/EffectResolver";

export class MultiTarget extends Target {
  private readonly clicksRequired: number;
  private clicksRemaining: number;

  constructor(
    spawn: TargetSpawn,
    modifiers: TargetSpawnModifiers = DEFAULT_TARGET_MODIFIERS,
    clicksOverride: number | null = null,
  ) {
    super("multi", spawn, modifiers);
    this.clicksRequired =
      clicksOverride !== null && clicksOverride > 0
        ? clicksOverride
        : this.config.clicksRequired;
    this.clicksRemaining = this.clicksRequired;
    this.spawn();
  }

  render(): void {
    this.decoration.clear();
    const ratio = this.clicksRemaining / this.clicksRequired;
    const ringRadius = this.initialSize * 0.65 * ratio;
    if (ringRadius > 0) {
      this.decoration
        .circle(0, 0, ringRadius)
        .stroke({ width: 6, color: 0xffffff });
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
      score: this.config.score * this.scoreMul,
      effects: [],
    };
  }
}
