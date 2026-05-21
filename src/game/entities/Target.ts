import { Graphics } from "pixi.js";
import {
  TARGET_CONFIG,
  type TargetKind,
  type TargetTypeConfig,
} from "../../data/targetConfig";
import { Tween } from "../util/Tween";
import { tweenManager } from "../util/TweenManager";
import {
  easeInOutQuad,
  easeOutBack,
  easeOutCubic,
  linear,
} from "../util/easings";
import { FEEL } from "../config/feel";
import {
  DEFAULT_TARGET_MODIFIERS,
  type TargetSpawnModifiers,
} from "../effects/EffectResolver";
import { bloomState, BLOOM_MAX_SCALE } from "../ultimates/BloomState";

export type TargetEffect = "lose_hp";

export type TargetPhase = "spawning" | "active" | "exiting" | "dead";

export interface ClickResult {
  destroyed: boolean;
  score: number;
  effects: TargetEffect[];
}

export interface TargetSpawn {
  x: number;
  y: number;
}

export interface TargetUpdateContext {
  cursorX: number;
  cursorY: number;
  centerX: number;
  centerY: number;
}

export abstract class Target {
  readonly id: string;
  readonly kind: TargetKind;
  readonly spawnTime: number;
  readonly lifetimeMs: number;
  readonly graphics: Graphics;
  readonly scoreMul: number;
  readonly modifiers: TargetSpawnModifiers;

  x: number;
  y: number;
  currentSize: number;
  phase: TargetPhase = "spawning";
  pairTarget: Target | null = null;

  protected readonly config: TargetTypeConfig;
  protected readonly initialSize: number;
  protected elapsedMs = 0;
  protected lifeScale = 1;
  protected animScale = 0;
  protected phaseInvisible = false;

  private readonly tweens: Tween[] = [];
  private exitedByMiss = false;

  constructor(
    kind: TargetKind,
    spawn: TargetSpawn,
    modifiers: TargetSpawnModifiers = DEFAULT_TARGET_MODIFIERS,
  ) {
    const config = TARGET_CONFIG[kind];
    this.kind = kind;
    this.config = config;
    this.modifiers = modifiers;
    this.id = crypto.randomUUID();
    this.x = spawn.x;
    this.y = spawn.y;
    this.lifetimeMs = config.lifetimeMs * modifiers.lifetimeMul;
    this.spawnTime = performance.now();
    this.initialSize = config.radius * modifiers.sizeMul;
    this.currentSize = this.initialSize;
    this.scoreMul = modifiers.scoreMul;

    this.graphics = new Graphics();
    this.graphics.position.set(this.x, this.y);
    this.graphics.eventMode = "static";
    this.graphics.cursor = "pointer";
  }

  abstract render(): void;
  abstract onClick(): ClickResult;

  get isDead(): boolean {
    return this.phase === "dead";
  }

  get isInteractive(): boolean {
    return this.phase === "spawning" || this.phase === "active";
  }

  get color(): number {
    return this.config.color;
  }

  get expiredUnclicked(): boolean {
    return this.exitedByMiss;
  }

  get isPhaseInvisible(): boolean {
    return this.phaseInvisible;
  }

  protected spawn(): void {
    this.render();
    this.phase = "spawning";
    if (this.modifiers.slowBloomPhaseMs > 0 && this.config.shrinks) {
      this.animScale = 1;
      this.lifeScale = 0;
      this.phase = "active";
      this.applyScale();
      return;
    }
    this.track(
      tweenManager.to(
        0,
        1,
        FEEL.spawnMs * this.modifiers.spawnAnimMul,
        (v) => {
          this.animScale = v;
          this.applyScale();
        },
        easeOutBack,
        () => {
          if (this.phase === "spawning") this.phase = "active";
        },
      ),
    );
  }

  update(deltaMs: number, ctx: TargetUpdateContext): void {
    if (this.phase === "dead") return;

    this.elapsedMs += deltaMs;
    this.applyDrift(deltaMs, ctx);
    this.updateLifeAndAlpha();
    this.graphics.position.set(this.x, this.y);

    if (
      (this.phase === "spawning" || this.phase === "active") &&
      this.elapsedMs >= this.lifetimeMs
    ) {
      this.beginMissExit();
    }
  }

  protected updateLifeAndAlpha(): void {
    if (this.phase === "active" && this.config.shrinks) {
      if (bloomState.active) {
        // Bloom ultimate: grow toward 200% over lifetime instead of shrinking.
        this.lifeScale = Math.min(
          1 + this.elapsedMs / this.lifetimeMs,
          BLOOM_MAX_SCALE,
        );
      } else {
        const phaseMs = this.modifiers.slowBloomPhaseMs;
        if (phaseMs > 0 && this.elapsedMs < phaseMs) {
          this.lifeScale = this.elapsedMs / phaseMs;
        } else {
          const tail = Math.max(this.lifetimeMs - phaseMs, 1);
          this.lifeScale = Math.max(1 - (this.elapsedMs - phaseMs) / tail, 0);
        }
      }
      this.currentSize = this.initialSize * this.lifeScale;
      this.applyScale();
    }

    this.applyPhaseFlash();
  }

  protected applyPhaseFlash(): void {
    const pf = this.modifiers.phaseFlash;
    if (pf === null) {
      this.phaseInvisible = false;
      return;
    }
    if (this.phase !== "spawning" && this.phase !== "active") {
      this.phaseInvisible = false;
      return;
    }
    const cycle = this.elapsedMs % pf.periodMs;
    const visibleMs = pf.periodMs - pf.invisibleMs;
    const invisible = cycle >= visibleMs;
    this.phaseInvisible = invisible;
    this.graphics.alpha = invisible ? 0.1 : 1;
  }

  private applyDrift(deltaMs: number, ctx: TargetUpdateContext): void {
    if (!this.isInteractive) return;
    const conv = this.modifiers.convergentDriftSpeed;
    const mag = this.modifiers.magnetSpeed;
    if (conv <= 0 && mag <= 0) return;

    let vx = 0;
    let vy = 0;
    if (conv > 0) {
      const dx = ctx.centerX - this.x;
      const dy = ctx.centerY - this.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.5) {
        vx += (dx / d) * conv;
        vy += (dy / d) * conv;
      }
    }
    if (mag > 0) {
      const dx = ctx.cursorX - this.x;
      const dy = ctx.cursorY - this.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.5) {
        vx += (dx / d) * mag;
        vy += (dy / d) * mag;
      }
    }
    const dt = deltaMs / 1000;
    this.x += vx * dt;
    this.y += vy * dt;
  }

  beginHitExit(): void {
    if (this.phase === "exiting" || this.phase === "dead") return;
    this.startExit();

    const peak = FEEL.hitOvershootScale;
    const upMs = FEEL.hitMs * 0.35;
    const downMs = FEEL.hitMs - upMs;

    this.track(
      tweenManager.to(
        this.animScale,
        peak,
        upMs,
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
              downMs,
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
    this.fadeOut(FEEL.hitMs);
  }

  beginPairKill(): void {
    if (this.phase === "exiting" || this.phase === "dead") return;
    this.startExit();
    this.track(
      tweenManager.to(
        this.animScale,
        0,
        FEEL.missMs,
        (v) => {
          this.animScale = v;
          this.applyScale();
        },
        easeInOutQuad,
        () => {
          this.phase = "dead";
        },
      ),
    );
    this.fadeOut(FEEL.missMs);
  }

  protected beginMissExit(): void {
    if (this.phase === "exiting" || this.phase === "dead") return;
    this.exitedByMiss = true;
    this.startExit();

    this.track(
      tweenManager.to(
        this.animScale,
        0,
        FEEL.missMs,
        (v) => {
          this.animScale = v;
          this.applyScale();
        },
        easeInOutQuad,
        () => {
          this.phase = "dead";
        },
      ),
    );
    this.fadeOut(FEEL.missMs);
  }

  protected pulse(): void {
    if (!this.isInteractive) return;
    const step = FEEL.pulseMs / 3;
    this.track(
      tweenManager.to(
        this.animScale,
        0.9,
        step,
        (v) => {
          this.animScale = v;
          this.applyScale();
        },
        easeOutCubic,
        () => {
          this.track(
            tweenManager.to(
              0.9,
              1.1,
              step,
              (v) => {
                this.animScale = v;
                this.applyScale();
              },
              easeOutCubic,
              () => {
                this.track(
                  tweenManager.to(
                    1.1,
                    1,
                    step,
                    (v) => {
                      this.animScale = v;
                      this.applyScale();
                    },
                    easeOutCubic,
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  destroy(): void {
    this.phase = "dead";
    this.cancelTweens();
    this.pairTarget = null;
    this.graphics.removeFromParent();
    this.graphics.destroy();
  }

  protected applyScale(): void {
    this.graphics.scale.set(this.lifeScale * this.animScale);
  }

  protected track(tween: Tween): Tween {
    this.tweens.push(tween);
    return tween;
  }

  protected cancelTweens(): void {
    for (const tween of this.tweens) tween.cancel();
    this.tweens.length = 0;
  }

  private startExit(): void {
    this.cancelTweens();
    this.phase = "exiting";
    this.graphics.eventMode = "none";
  }

  private fadeOut(durationMs: number): void {
    this.track(
      tweenManager.to(
        this.graphics.alpha,
        0,
        durationMs,
        (a) => {
          this.graphics.alpha = a;
        },
        linear,
      ),
    );
  }
}
