import { Target, type ClickResult, type TargetSpawn } from "./Target";
import { tweenManager } from "../util/TweenManager";
import { easeOutCubic, linear } from "../util/easings";
import { FEEL } from "../config/feel";

const SPIKES = 6;

export class BombTarget extends Target {
  constructor(spawn: TargetSpawn) {
    super("bomb", spawn);
    this.spawn();
  }

  render(): void {
    this.graphics.clear();
    const outer = this.initialSize;
    const inner = this.initialSize * 0.5;
    const points: number[] = [];
    for (let i = 0; i < SPIKES * 2; i++) {
      const radius = i % 2 === 0 ? outer : inner;
      const angle = -Math.PI / 2 + (i * Math.PI) / SPIKES;
      points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    this.graphics.poly(points).fill(this.config.color);
  }

  update(deltaMs: number): void {
    super.update(deltaMs);
    if (this.phase !== "active") return;
    const remaining = 1 - this.elapsedMs / this.lifetimeMs;
    const periodMs = 120 + 360 * remaining;
    const visible = Math.floor(this.elapsedMs / periodMs) % 2 === 0;
    this.graphics.alpha = visible ? 1 : 0.3;
  }

  beginHitExit(): void {
    if (this.phase === "exiting" || this.phase === "dead") return;
    this.cancelTweens();
    this.phase = "exiting";
    this.graphics.eventMode = "none";
    this.graphics.alpha = 1;

    const peak = FEEL.bombHitScale;
    const half = FEEL.bombHitMs * 0.5;

    this.track(
      tweenManager.to(
        this.animScale,
        peak,
        half,
        (v) => {
          this.animScale = v;
          this.applyScale();
        },
        easeOutCubic,
        () => {
          this.track(
            tweenManager.to(
              peak,
              0,
              half,
              (v) => {
                this.animScale = v;
                this.applyScale();
              },
              easeOutCubic,
              () => {
                this.phase = "dead";
              },
            ),
          );
        },
      ),
    );
    this.track(
      tweenManager.to(
        1,
        0,
        FEEL.bombHitMs,
        (a) => {
          this.graphics.alpha = a;
        },
        linear,
      ),
    );
  }

  onClick(): ClickResult {
    return { destroyed: true, score: 0, effects: ["lose_hp"] };
  }
}
