import { Target, type ClickResult, type TargetSpawn } from "./Target";

export class MultiTarget extends Target {
  private clicksRemaining: number;

  constructor(spawn: TargetSpawn) {
    super("multi", spawn);
    this.clicksRemaining = this.config.clicksRequired;
    this.spawn();
  }

  render(): void {
    this.graphics.clear();
    this.graphics.circle(0, 0, this.initialSize).fill(this.config.color);
    const ratio = this.clicksRemaining / this.config.clicksRequired;
    const ringRadius = this.initialSize * 0.65 * ratio;
    if (ringRadius > 0) {
      this.graphics
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
    return { destroyed: true, score: this.config.score, effects: [] };
  }
}
