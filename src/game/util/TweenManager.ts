import { Tween } from "./Tween";
import { easeOutCubic, type EasingFn } from "./easings";

class TweenManager {
  private tweens: Tween[] = [];

  add(tween: Tween): Tween {
    this.tweens.push(tween);
    return tween;
  }

  to(
    from: number,
    target: number,
    durationMs: number,
    onUpdate: (value: number) => void,
    easing: EasingFn = easeOutCubic,
    onComplete?: () => void,
  ): Tween {
    return this.add(
      new Tween(from, target, durationMs, onUpdate, easing, onComplete),
    );
  }

  update(deltaMs: number): void {
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tween = this.tweens[i];
      if (tween === undefined) continue;
      if (!tween.update(deltaMs)) this.tweens.splice(i, 1);
    }
  }

  clear(): void {
    for (const tween of this.tweens) tween.cancel();
    this.tweens.length = 0;
  }

  get count(): number {
    return this.tweens.length;
  }
}

export const tweenManager = new TweenManager();
