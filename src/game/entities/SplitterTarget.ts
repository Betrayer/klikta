import { Target, type ClickResult, type TargetSpawn } from "./Target";
import {
  DEFAULT_TARGET_MODIFIERS,
  type TargetSpawnModifiers,
} from "../effects/EffectResolver";

export class SplitterTarget extends Target {
  constructor(
    spawn: TargetSpawn,
    modifiers: TargetSpawnModifiers = DEFAULT_TARGET_MODIFIERS,
  ) {
    super("splitter", spawn, modifiers);
    this.spawn();
  }

  render(): void {
    this.decoration.clear();
    const r = this.initialSize;
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2;
      this.decoration
        .moveTo(0, 0)
        .lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
        .stroke({ width: 4, color: 0x0a0014, alpha: 0.55 });
    }
  }

  onClick(): ClickResult {
    return {
      destroyed: true,
      score: this.config.score * this.scoreMul,
      effects: [],
    };
  }
}
