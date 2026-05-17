import { Container, Graphics } from "pixi.js";
import { BOMB_PARTICLE_COLORS, FEEL } from "../config/feel";

interface Particle {
  gfx: Graphics;
  vx: number;
  vy: number;
  lifeMs: number;
  maxLifeMs: number;
  active: boolean;
}

export class VFXSystem {
  private readonly layer: Container;
  private readonly pool: Particle[] = [];

  constructor(layer: Container) {
    this.layer = layer;
    this.layer.eventMode = "none";

    for (let i = 0; i < FEEL.particles.poolSize; i++) {
      const gfx = new Graphics()
        .circle(0, 0, FEEL.particles.baseRadius)
        .fill(0xffffff);
      gfx.eventMode = "none";
      gfx.visible = false;
      this.layer.addChild(gfx);
      this.pool.push({
        gfx,
        vx: 0,
        vy: 0,
        lifeMs: 0,
        maxLifeMs: 1,
        active: false,
      });
    }
  }

  emitHit(x: number, y: number, color: number): void {
    const { count, speed, lifeMs } = FEEL.particles.hit;
    this.burst(x, y, count, speed, lifeMs, () => color);
  }

  emitSubHit(x: number, y: number, color: number): void {
    const { count, speed, lifeMs } = FEEL.particles.subhit;
    this.burst(x, y, count, speed, lifeMs, () => color);
  }

  emitGoldenHit(x: number, y: number): void {
    const { count, speed, lifeMs } = FEEL.particles.golden;
    this.burst(x, y, count, speed, lifeMs, (i) =>
      i % 3 === 0 ? 0xffffff : 0xffd700,
    );
  }

  emitBombExplosion(x: number, y: number): void {
    const { count, speed, lifeMs } = FEEL.particles.bomb;
    this.burst(x, y, count, speed, lifeMs, (i) => {
      const picked = BOMB_PARTICLE_COLORS[i % BOMB_PARTICLE_COLORS.length];
      return picked ?? 0xff1f3f;
    });
  }

  emitMilestone(x: number, y: number): void {
    const { count, speed, lifeMs } = FEEL.particles.milestone;
    this.burst(x, y, count, speed, lifeMs, (i) =>
      i % 2 === 0 ? 0x00f5d4 : 0xffffff,
    );
  }

  update(deltaMs: number): void {
    for (const p of this.pool) {
      if (!p.active) continue;
      p.lifeMs -= deltaMs;
      if (p.lifeMs <= 0) {
        p.active = false;
        p.gfx.visible = false;
        continue;
      }
      const t = p.lifeMs / p.maxLifeMs;
      p.gfx.x += p.vx * deltaMs;
      p.gfx.y += p.vy * deltaMs;
      p.gfx.alpha = t;
      p.gfx.scale.set(0.4 + 0.6 * t);
    }
  }

  clear(): void {
    for (const p of this.pool) {
      p.active = false;
      p.gfx.visible = false;
    }
  }

  private burst(
    x: number,
    y: number,
    count: number,
    speed: number,
    lifeMs: number,
    colorFor: (index: number) => number,
  ): void {
    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      const angle = Math.random() * Math.PI * 2;
      const power = speed * (0.5 + Math.random() * 0.5);
      p.vx = Math.cos(angle) * power;
      p.vy = Math.sin(angle) * power;
      p.lifeMs = lifeMs;
      p.maxLifeMs = lifeMs;
      p.active = true;
      p.gfx.tint = colorFor(i);
      p.gfx.position.set(x, y);
      p.gfx.scale.set(1);
      p.gfx.alpha = 1;
      p.gfx.visible = true;
    }
  }

  private acquire(): Particle {
    let oldest = this.pool[0];
    for (const p of this.pool) {
      if (!p.active) return p;
      if (oldest === undefined || p.lifeMs < oldest.lifeMs) oldest = p;
    }
    if (oldest === undefined) throw new Error("VFX pool is empty");
    return oldest;
  }
}
