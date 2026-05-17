import { Graphics } from "pixi.js";

export interface TargetConfig {
  x: number;
  y: number;
  lifetimeMs: number;
  score: number;
}

const INITIAL_RADIUS = 40;

export class Target {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly spawnTime: number;
  readonly lifetimeMs: number;
  readonly score: number;
  readonly initialSize: number;
  readonly graphics: Graphics;

  currentSize: number;
  alive = true;

  private elapsedMs = 0;

  constructor(config: TargetConfig) {
    this.id = crypto.randomUUID();
    this.x = config.x;
    this.y = config.y;
    this.lifetimeMs = config.lifetimeMs;
    this.score = config.score;
    this.spawnTime = performance.now();
    this.initialSize = INITIAL_RADIUS;
    this.currentSize = INITIAL_RADIUS;

    this.graphics = new Graphics().circle(0, 0, INITIAL_RADIUS).fill(0xff006e);
    this.graphics.position.set(this.x, this.y);
    this.graphics.eventMode = "static";
    this.graphics.cursor = "pointer";
  }

  update(deltaMs: number): void {
    if (!this.alive) return;

    this.elapsedMs += deltaMs;
    const remaining = 1 - this.elapsedMs / this.lifetimeMs;
    this.currentSize = this.initialSize * Math.max(remaining, 0);

    if (this.currentSize <= 0) {
      this.alive = false;
      return;
    }

    this.graphics.scale.set(this.currentSize / this.initialSize);
  }

  destroy(): void {
    this.alive = false;
    this.graphics.removeFromParent();
    this.graphics.destroy();
  }
}
