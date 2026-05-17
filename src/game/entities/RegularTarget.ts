import { Target, type ClickResult, type TargetSpawn } from "./Target";

export class RegularTarget extends Target {
  constructor(spawn: TargetSpawn) {
    super("regular", spawn);
    this.spawn();
  }

  render(): void {
    this.graphics.clear();
    this.graphics.circle(0, 0, this.initialSize).fill(this.config.color);
  }

  onClick(): ClickResult {
    return { destroyed: true, score: this.config.score, effects: [] };
  }
}
