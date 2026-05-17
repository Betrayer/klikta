import { Container } from "pixi.js";

export class CameraSystem {
  private readonly stage: Container;
  private intensity = 0;
  private durationMs = 0;
  private remainingMs = 0;

  constructor(stage: Container) {
    this.stage = stage;
  }

  shake(intensity: number, durationMs: number): void {
    if (this.remainingMs > 0 && intensity <= this.intensity) return;
    this.intensity = intensity;
    this.durationMs = durationMs;
    this.remainingMs = durationMs;
  }

  update(deltaMs: number): void {
    if (this.remainingMs <= 0) {
      if (this.stage.position.x !== 0 || this.stage.position.y !== 0) {
        this.stage.position.set(0, 0);
      }
      return;
    }

    this.remainingMs -= deltaMs;
    if (this.remainingMs <= 0) {
      this.reset();
      return;
    }

    const amplitude = this.intensity * (this.remainingMs / this.durationMs);
    this.stage.position.set(
      (Math.random() * 2 - 1) * amplitude,
      (Math.random() * 2 - 1) * amplitude,
    );
  }

  reset(): void {
    this.intensity = 0;
    this.durationMs = 0;
    this.remainingMs = 0;
    this.stage.position.set(0, 0);
  }
}
