import { easeOutCubic, type EasingFn } from "./easings";

export class Tween {
  private readonly from: number;
  private readonly to: number;
  private readonly durationMs: number;
  private readonly onUpdate: (value: number) => void;
  private readonly easing: EasingFn;
  private readonly onComplete: (() => void) | undefined;
  private elapsedMs = 0;
  private active = true;

  constructor(
    from: number,
    to: number,
    durationMs: number,
    onUpdate: (value: number) => void,
    easing: EasingFn = easeOutCubic,
    onComplete?: () => void,
  ) {
    this.from = from;
    this.to = to;
    this.durationMs = durationMs;
    this.onUpdate = onUpdate;
    this.easing = easing;
    this.onComplete = onComplete;
    this.onUpdate(from);
  }

  update(deltaMs: number): boolean {
    if (!this.active) return false;

    this.elapsedMs += deltaMs;
    const progress =
      this.durationMs <= 0 ? 1 : Math.min(this.elapsedMs / this.durationMs, 1);
    this.onUpdate(this.from + (this.to - this.from) * this.easing(progress));

    if (progress >= 1) {
      this.active = false;
      this.onComplete?.();
      return false;
    }
    return true;
  }

  get isActive(): boolean {
    return this.active;
  }

  cancel(): void {
    this.active = false;
  }
}
