import { TARGET_CONFIG } from "../../data/targetConfig";
import { Target, type ClickResult, type TargetSpawn } from "./Target";
import { tweenManager } from "../util/TweenManager";
import { easeOutCubic, linear } from "../util/easings";
import { FEEL } from "../config/feel";
import {
  DEFAULT_TARGET_MODIFIERS,
  type TargetSpawnModifiers,
} from "../effects/EffectResolver";
import { bloomState, BLOOM_BOMB_MAX_SCALE } from "../ultimates/BloomState";

const SPIKES = 6;
const DECOY_GOLDEN_COLOR = TARGET_CONFIG.golden.color;

export class BombTarget extends Target {
  readonly appearAsGolden: boolean;

  constructor(
    spawn: TargetSpawn,
    modifiers: TargetSpawnModifiers = DEFAULT_TARGET_MODIFIERS,
    appearAsGolden = false,
  ) {
    super("bomb", spawn, modifiers);
    this.appearAsGolden = appearAsGolden;
    this.spawn();
  }

  render(): void {
    this.graphics.clear();
    if (this.appearAsGolden) {
      this.graphics
        .circle(0, 0, this.initialSize * 0.8)
        .fill(DECOY_GOLDEN_COLOR);
      this.graphics
        .circle(0, 0, this.initialSize * 0.44)
        .stroke({ width: 4, color: 0xffffff });
      return;
    }
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

  protected override updateLifeAndAlpha(): void {
    if (this.phase !== "active") return;

    if (bloomState.active) {
      // Bloom ultimate: bombs grow alongside targets instead of pulsing.
      const t = Math.min(this.elapsedMs / this.lifetimeMs, 1);
      this.lifeScale = 1 + (BLOOM_BOMB_MAX_SCALE - 1) * t;
      this.currentSize = this.initialSize * this.lifeScale;
      this.applyScale();
      this.graphics.alpha = 1;
      return;
    }

    const beacon = this.modifiers.beaconBombGrowToScale;
    if (beacon !== null) {
      const t = Math.min(this.elapsedMs / this.lifetimeMs, 1);
      this.lifeScale = 1 + (beacon - 1) * t;
      this.currentSize = this.initialSize * this.lifeScale;
      this.applyScale();
      this.graphics.alpha = 1;
      return;
    }

    // Plain bombs keep scale 1; reset it in case Bloom just ended mid-life.
    if (this.lifeScale !== 1) {
      this.lifeScale = 1;
      this.applyScale();
    }

    const remaining = 1 - this.elapsedMs / this.lifetimeMs;
    let periodMs = 120 + 360 * remaining;
    const endZoneMs = this.modifiers.bombBlinkFasterEndMs;
    if (endZoneMs > 0 && this.lifetimeMs - this.elapsedMs < endZoneMs) {
      periodMs *= 0.5;
    }
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
