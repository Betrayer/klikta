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

export abstract class Target {
  readonly id: string;
  readonly kind: TargetKind;
  readonly x: number;
  readonly y: number;
  readonly spawnTime: number;
  readonly lifetimeMs: number;
  readonly graphics: Graphics;

  currentSize: number;
  phase: TargetPhase = "spawning";

  protected readonly config: TargetTypeConfig;
  protected readonly initialSize: number;
  protected elapsedMs = 0;
  protected lifeScale = 1;
  protected animScale = 0;

  private readonly tweens: Tween[] = [];

  constructor(kind: TargetKind, spawn: TargetSpawn) {
    const config = TARGET_CONFIG[kind];
    this.kind = kind;
    this.config = config;
    this.id = crypto.randomUUID();
    this.x = spawn.x;
    this.y = spawn.y;
    this.lifetimeMs = config.lifetimeMs;
    this.spawnTime = performance.now();
    this.initialSize = config.radius;
    this.currentSize = config.radius;

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

  protected spawn(): void {
    this.render();
    this.phase = "spawning";
    this.track(
      tweenManager.to(
        0,
        1,
        FEEL.spawnMs,
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

  update(deltaMs: number): void {
    if (this.phase === "dead") return;

    this.elapsedMs += deltaMs;

    if (this.phase === "active" && this.config.shrinks) {
      this.lifeScale = Math.max(1 - this.elapsedMs / this.lifetimeMs, 0);
      this.currentSize = this.initialSize * this.lifeScale;
      this.applyScale();
    }

    if (
      (this.phase === "spawning" || this.phase === "active") &&
      this.elapsedMs >= this.lifetimeMs
    ) {
      this.beginMissExit();
    }
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

  protected beginMissExit(): void {
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
