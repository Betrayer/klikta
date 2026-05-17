import { Target, type ClickResult, type TargetSpawn } from "./Target";

export class GoldenTarget extends Target {
  constructor(spawn: TargetSpawn) {
    super("golden", spawn);
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
    return { destroyed: true, score: this.config.score, effects: [] };
  }
}
