import { Target, type ClickResult, type TargetSpawn } from "./Target";
import {
  DEFAULT_TARGET_MODIFIERS,
  type TargetSpawnModifiers,
} from "../effects/EffectResolver";

export class RegularTarget extends Target {
  constructor(
    spawn: TargetSpawn,
    modifiers: TargetSpawnModifiers = DEFAULT_TARGET_MODIFIERS,
  ) {
    super("regular", spawn, modifiers);
    this.spawn();
  }

  onClick(): ClickResult {
    return {
      destroyed: true,
      score: this.config.score * this.scoreMul,
      effects: [],
    };
  }
}
