import { Target, type ClickResult, type TargetSpawn } from "./Target";
import type { TargetVisual } from "../../data/themes/types";
import { getActiveTheme } from "../../state/themeSelectors";
import { tweenManager } from "../util/TweenManager";
import { easeOutCubic, linear } from "../util/easings";
import { FEEL } from "../config/feel";
import {
  DEFAULT_TARGET_MODIFIERS,
  type TargetSpawnModifiers,
} from "../effects/EffectResolver";
import { bloomState, BLOOM_BOMB_MAX_SCALE } from "../ultimates/BloomState";

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

  protected override resolveVisual(): TargetVisual {
    const theme = getActiveTheme();
    return this.appearAsGolden ? theme.targets.golden : theme.targets.bomb;
  }

  protected override baseSize(): number {
    return this.appearAsGolden ? this.initialSize * 0.8 : this.initialSize;
  }

  render(): void {
    this.decoration.clear();
    if (this.appearAsGolden) {
      this.decoration
        .circle(0, 0, this.initialSize * 0.44)
        .stroke({ width: 4, color: 0xffffff });
    }
  }

  protected override updateLifeAndAlpha(): void {
    if (this.phase !== "active") return;

    if (bloomState.active) {
      const t = Math.min(this.elapsedMs / this.lifetimeMs, 1);
      this.lifeScale = 1 + (BLOOM_BOMB_MAX_SCALE - 1) * t;
      this.currentSize = this.initialSize * this.lifeScale;
      this.applyScale();
      this.view.alpha = 1;
      return;
    }

    const beacon = this.modifiers.beaconBombGrowToScale;
    if (beacon !== null) {
      const t = Math.min(this.elapsedMs / this.lifetimeMs, 1);
      this.lifeScale = 1 + (beacon - 1) * t;
      this.currentSize = this.initialSize * this.lifeScale;
      this.applyScale();
      this.view.alpha = 1;
      return;
    }

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
    this.view.alpha = visible ? 1 : 0.3;
  }

  beginHitExit(): void {
    if (this.phase === "exiting" || this.phase === "dead") return;
    this.cancelTweens();
    this.phase = "exiting";
    this.base.eventMode = "none";
    this.view.alpha = 1;

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
          this.view.alpha = a;
        },
        linear,
      ),
    );
  }

  onClick(): ClickResult {
    return { destroyed: true, score: 0, effects: ["lose_hp"] };
  }
}
