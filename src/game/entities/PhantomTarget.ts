import { Graphics } from "pixi.js";

export interface PhantomSpawn {
  x: number;
  y: number;
  radius: number;
  color: number;
  bonusScore: number;
  lifetimeMs: number;
}

export class PhantomTarget {
  readonly id: string;
  readonly graphics: Graphics;
  readonly bonusScore: number;
  readonly color: number;

  private readonly radius: number;
  private readonly lifetimeMs: number;
  private readonly baseAlpha = 0.45;
  private elapsedMs = 0;
  private collected = false;

  constructor(spawn: PhantomSpawn) {
    this.id = crypto.randomUUID();
    this.bonusScore = spawn.bonusScore;
    this.color = spawn.color;
    this.radius = spawn.radius;
    this.lifetimeMs = spawn.lifetimeMs;

    this.graphics = new Graphics();
    this.graphics.position.set(spawn.x, spawn.y);
    this.graphics.eventMode = "static";
    this.graphics.cursor = "pointer";
    this.render();
  }

  get x(): number {
    return this.graphics.position.x;
  }

  get y(): number {
    return this.graphics.position.y;
  }

  get isDead(): boolean {
    return this.collected || this.elapsedMs >= this.lifetimeMs;
  }

  get isInteractive(): boolean {
    return !this.isDead;
  }

  update(deltaMs: number): void {
    if (this.collected) return;
    this.elapsedMs += deltaMs;
    const t = Math.min(this.elapsedMs / this.lifetimeMs, 1);
    this.graphics.alpha = this.baseAlpha * (1 - t);
    this.graphics.scale.set(1 - t);
  }

  collect(): void {
    this.collected = true;
    this.graphics.eventMode = "none";
  }

  destroy(): void {
    this.collected = true;
    this.graphics.removeFromParent();
    this.graphics.destroy();
  }

  private render(): void {
    this.graphics
      .clear()
      .circle(0, 0, this.radius)
      .fill(this.color)
      .stroke({ width: 2, color: this.color, alpha: 1 });
    this.graphics.alpha = this.baseAlpha;
  }
}
