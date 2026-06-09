import { Container, Graphics } from "pixi.js";
import {
  TARGET_CONFIG,
  type TargetKind,
  type TargetTypeConfig,
} from "../../data/targetConfig";
import type { TargetVisual } from "../../data/themes/types";
import { getActiveTheme } from "../../state/themeSelectors";
import { rendererFor } from "./render/TargetRenderer";
import { resolveStateTexture } from "./render/SpriteRenderer";
import { Tween } from "../util/Tween";
import { tweenManager } from "../util/TweenManager";
import { touchRadiusMul } from "../util/device";
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
  readonly view: Container;
  readonly scoreMul: number;
  readonly modifiers: TargetSpawnModifiers;

  x: number;
  y: number;
  currentSize: number;
  phase: TargetPhase = "spawning";
  pairTarget: Target | null = null;
  physicsControlled = false;

  protected readonly config: TargetTypeConfig;
  protected readonly decoration: Graphics;
  protected base!: Container;
  protected visual: TargetVisual;
  protected visualOverride: TargetVisual | null = null;
  protected readonly initialSize: number;
  protected elapsedMs = 0;
  protected lifeScale = 1;
  protected animScale = 0;
  protected phaseInvisible = false;
  protected suppressLifeShrink = false;
  protected linearDriftVx = 0;
  protected linearDriftVy = 0;

  private readonly tweens: Tween[] = [];
  private exitedByMiss = false;
  private pointerDownHandler: (() => void) | null = null;

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
    this.initialSize = config.radius * modifiers.sizeMul * touchRadiusMul();
    this.currentSize = this.initialSize;
    this.scoreMul = modifiers.scoreMul;
    this.visual = { mode: "vector", shape: "circle", color: config.color };

    this.view = new Container();
    this.view.position.set(this.x, this.y);
    this.view.eventMode = "passive";

    this.decoration = new Graphics();
    this.decoration.eventMode = "none";
    this.view.addChild(this.decoration);
  }

  abstract onClick(): ClickResult;

  render(): void {}

  protected currentVisualState(): string | null {
    return null;
  }

  protected currentStateTexture(): string | undefined {
    if (this.visual.mode !== "sprite") return undefined;
    const state = this.currentVisualState();
    if (state === null) return undefined;
    return resolveStateTexture(this.visual.states, state);
  }

  protected spriteDecorationSuppressed(): boolean {
    return this.visual.mode === "sprite" && this.visual.texture !== undefined;
  }

  protected refreshVisualState(): void {
    if (this.visual.mode !== "sprite" || this.visual.states === undefined) return;
    this.rebuildBase(this.baseSize());
  }

  bindPointerDown(handler: () => void): void {
    this.pointerDownHandler = handler;
    this.base.on("pointerdown", handler);
  }

  setSplitterShard(vx: number, vy: number): void {
    this.suppressLifeShrink = true;
    this.linearDriftVx = vx;
    this.linearDriftVy = vy;
  }

  get isDead(): boolean {
    return this.phase === "dead";
  }

  get isInteractive(): boolean {
    return this.phase === "spawning" || this.phase === "active";
  }

  get color(): number {
    return this.visual.color ?? this.config.color;
  }

  get expiredUnclicked(): boolean {
    return this.exitedByMiss;
  }

  get isPhaseInvisible(): boolean {
    return this.phaseInvisible;
  }

  protected resolveVisual(): TargetVisual {
    return this.visualOverride ?? getActiveTheme().targets[this.kind];
  }

  protected baseSize(): number {
    return this.initialSize;
  }

  protected buildBase(): void {
    this.visual = this.resolveVisual();
    this.attachBase(this.baseSize());
  }

  protected rebuildBase(size: number): void {
    this.base.removeFromParent();
    this.base.destroy();
    this.attachBase(size);
  }

  private attachBase(size: number): void {
    this.base = rendererFor(this.visual.mode).build(
      this.visual,
      size,
      this.currentVisualState(),
    );
    this.base.eventMode = "static";
    this.base.cursor = "pointer";
    if (this.pointerDownHandler !== null) {
      this.base.on("pointerdown", this.pointerDownHandler);
    }
    this.view.addChildAt(this.base, 0);
  }

  protected spawn(): void {
    this.buildBase();
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
    this.view.position.set(this.x, this.y);

    if (
      (this.phase === "spawning" || this.phase === "active") &&
      this.elapsedMs >= this.lifetimeMs
    ) {
      this.beginMissExit();
    }
  }

  protected updateLifeAndAlpha(): void {
    if (this.phase === "active" && this.config.shrinks && !this.suppressLifeShrink) {
      if (bloomState.active) {
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
          const lastChance = this.modifiers.lastChanceMs;
          const shrinkElapsed =
            lastChance > 0
              ? Math.min(
                  this.elapsedMs,
                  Math.max(this.lifetimeMs - lastChance, phaseMs),
                )
              : this.elapsedMs;
          this.lifeScale = Math.max(1 - (shrinkElapsed - phaseMs) / tail, 0);
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
    this.view.alpha = invisible ? 0.1 : 1;
  }

  private applyDrift(deltaMs: number, ctx: TargetUpdateContext): void {
    if (this.physicsControlled) return;
    if (!this.isInteractive) return;
    const conv = this.modifiers.convergentDriftSpeed;
    const mag = this.modifiers.magnetSpeed;
    const hasLinear = this.linearDriftVx !== 0 || this.linearDriftVy !== 0;
    if (conv <= 0 && mag <= 0 && !hasLinear) return;

    let vx = this.linearDriftVx;
    let vy = this.linearDriftVy;
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
    this.view.removeFromParent();
    this.view.destroy({ children: true });
  }

  protected applyScale(): void {
    this.view.scale.set(this.lifeScale * this.animScale);
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
    this.base.eventMode = "none";
  }

  private fadeOut(durationMs: number): void {
    this.track(
      tweenManager.to(
        this.view.alpha,
        0,
        durationMs,
        (a) => {
          this.view.alpha = a;
        },
        linear,
      ),
    );
  }
}
