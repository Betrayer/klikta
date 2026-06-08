import { Container, Graphics } from "pixi.js";
import { FEEL } from "../config/feel";
import { getActiveTheme, getVfxStyle } from "../../state/themeSelectors";
import type {
  BombExplosionStyle,
  GoldenSparkleStyle,
  HitParticleShape,
  ParticlePalettes,
} from "../../data/themes/types";

interface Particle {
  gfx: Graphics;
  vx: number;
  vy: number;
  lifeMs: number;
  maxLifeMs: number;
  gravity: number;
  active: boolean;
}

interface EmitShapedParams {
  count: number;
  speed: number;
  lifeMs: number;
  gravity: number;
  evenAngles: boolean;
  angleMin: number;
  angleMax: number;
  colorFor: (index: number) => number;
}

const drawParticleShape = (
  gfx: Graphics,
  shape: HitParticleShape,
  radius: number,
): void => {
  switch (shape) {
    case "circle":
      gfx.circle(0, 0, radius);
      break;
    case "square":
      gfx.rect(-radius, -radius, radius * 2, radius * 2);
      break;
    case "star":
      gfx.star(0, 0, 5, radius, radius * 0.5);
      break;
    case "petal":
      gfx.ellipse(0, 0, radius * 0.6, radius * 1.1);
      break;
  }
  gfx.fill(0xffffff);
};

export class VFXSystem {
  private readonly layer: Container;
  private readonly pool: Particle[] = [];
  private readonly palettes: ParticlePalettes;
  private readonly scaleBase: number;
  private readonly goldenSparkle: GoldenSparkleStyle;
  private readonly bombExplosion: BombExplosionStyle;

  constructor(layer: Container) {
    this.layer = layer;
    this.palettes = getActiveTheme().particles;
    const vfx = getVfxStyle();
    this.scaleBase = vfx.hitParticleScale;
    this.goldenSparkle = vfx.goldenSparkle;
    this.bombExplosion = vfx.bombExplosion;
    this.layer.eventMode = "none";

    for (let i = 0; i < FEEL.particles.poolSize; i++) {
      const gfx = new Graphics();
      drawParticleShape(gfx, vfx.hitParticleShape, FEEL.particles.baseRadius);
      gfx.eventMode = "none";
      gfx.visible = false;
      this.layer.addChild(gfx);
      this.pool.push({
        gfx,
        vx: 0,
        vy: 0,
        lifeMs: 0,
        maxLifeMs: 1,
        gravity: 0,
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
    const pal = this.palettes.golden;
    const accent = pal[0] ?? 0xffffff;
    const main = pal[1] ?? 0xffd700;
    const colorFor = (i: number): number => (i % 3 === 0 ? accent : main);
    if (this.goldenSparkle === "starburst") {
      const v = FEEL.particles.vfxVariants.golden.starburst;
      this.emitShaped(x, y, {
        count: Math.round(count * v.countMul),
        speed: speed * v.speedMul,
        lifeMs: lifeMs * v.lifeMul,
        gravity: v.gravity,
        evenAngles: true,
        angleMin: 0,
        angleMax: Math.PI * 2,
        colorFor,
      });
      return;
    }
    if (this.goldenSparkle === "pollen") {
      const v = FEEL.particles.vfxVariants.golden.pollen;
      this.emitShaped(x, y, {
        count: Math.round(count * v.countMul),
        speed: speed * v.speedMul,
        lifeMs: lifeMs * v.lifeMul,
        gravity: v.gravity,
        evenAngles: false,
        angleMin: 0,
        angleMax: Math.PI * 2,
        colorFor,
      });
      return;
    }
    this.burst(x, y, count, speed, lifeMs, colorFor);
  }

  emitBombExplosion(x: number, y: number): void {
    const { count, speed, lifeMs } = FEEL.particles.bomb;
    const pal = this.palettes.bomb;
    const colorFor = (i: number): number => pal[i % pal.length] ?? 0xff1f3f;
    if (this.bombExplosion === "firework") {
      const ring = FEEL.particles.vfxVariants.bomb.fireworkRing;
      const sparks = FEEL.particles.vfxVariants.bomb.fireworkSparks;
      this.emitShaped(x, y, {
        count: Math.round(count * ring.countMul),
        speed: speed * ring.speedMul,
        lifeMs: lifeMs * ring.lifeMul,
        gravity: ring.gravity,
        evenAngles: true,
        angleMin: 0,
        angleMax: Math.PI * 2,
        colorFor,
      });
      this.emitShaped(x, y, {
        count: Math.round(count * sparks.countMul),
        speed: speed * sparks.speedMul,
        lifeMs: lifeMs * sparks.lifeMul,
        gravity: sparks.gravity,
        evenAngles: false,
        angleMin: 0,
        angleMax: Math.PI * 2,
        colorFor,
      });
      return;
    }
    if (this.bombExplosion === "wilt") {
      const v = FEEL.particles.vfxVariants.bomb.wilt;
      this.emitShaped(x, y, {
        count: Math.round(count * v.countMul),
        speed: speed * v.speedMul,
        lifeMs: lifeMs * v.lifeMul,
        gravity: v.gravity,
        evenAngles: false,
        angleMin: -Math.PI * 0.9,
        angleMax: -Math.PI * 0.1,
        colorFor,
      });
      return;
    }
    this.burst(x, y, count, speed, lifeMs, colorFor);
  }

  emitMilestone(x: number, y: number): void {
    const { count, speed, lifeMs } = FEEL.particles.milestone;
    const pal = this.palettes.milestone;
    const accent = pal[0] ?? 0x00f5d4;
    const main = pal[1] ?? 0xffffff;
    this.burst(x, y, count, speed, lifeMs, (i) =>
      i % 2 === 0 ? accent : main,
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
      p.vy += p.gravity * deltaMs;
      p.gfx.x += p.vx * deltaMs;
      p.gfx.y += p.vy * deltaMs;
      p.gfx.alpha = t;
      p.gfx.scale.set((0.4 + 0.6 * t) * this.scaleBase);
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
      p.gravity = 0;
      p.lifeMs = lifeMs;
      p.maxLifeMs = lifeMs;
      p.active = true;
      p.gfx.tint = colorFor(i);
      p.gfx.position.set(x, y);
      p.gfx.scale.set(this.scaleBase);
      p.gfx.alpha = 1;
      p.gfx.visible = true;
    }
  }

  private emitShaped(x: number, y: number, params: EmitShapedParams): void {
    const span = params.angleMax - params.angleMin;
    for (let i = 0; i < params.count; i++) {
      const p = this.acquire();
      const angle = params.evenAngles
        ? params.angleMin + (span * i) / params.count
        : params.angleMin + Math.random() * span;
      const power = params.evenAngles
        ? params.speed
        : params.speed * (0.5 + Math.random() * 0.5);
      p.vx = Math.cos(angle) * power;
      p.vy = Math.sin(angle) * power;
      p.gravity = params.gravity;
      p.lifeMs = params.lifeMs;
      p.maxLifeMs = params.lifeMs;
      p.active = true;
      p.gfx.tint = params.colorFor(i);
      p.gfx.position.set(x, y);
      p.gfx.scale.set(this.scaleBase);
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
