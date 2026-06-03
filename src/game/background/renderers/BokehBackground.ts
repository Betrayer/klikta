import { Container, Graphics, Sprite, Texture } from "pixi.js";
import type { BackgroundSpec } from "../../../data/themes/types";
import {
  BACKGROUND_OVERSCAN,
  DEFAULT_BACKGROUND_COLOR,
  type BackgroundRenderer,
  type BackgroundViewport,
} from "../BackgroundRenderer";

interface Bokeh {
  sprite: Sprite;
  vx: number;
  vy: number;
  baseAlpha: number;
  pulse: number;
  pulseSpeed: number;
}

const SOFT_CIRCLE_SIZE = 128;
const MIN_RADIUS = 24;
const RADIUS_RANGE = 80;
const DRIFT_MIN = 0.004;
const DRIFT_RANGE = 0.012;
const PARTICLES_PER_DENSITY = 5;

const createSoftCircleTexture = (): Texture => {
  const canvas = document.createElement("canvas");
  canvas.width = SOFT_CIRCLE_SIZE;
  canvas.height = SOFT_CIRCLE_SIZE;
  const ctx = canvas.getContext("2d");
  if (ctx === null) return Texture.WHITE;
  const r = SOFT_CIRCLE_SIZE / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.55)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SOFT_CIRCLE_SIZE, SOFT_CIRCLE_SIZE);
  return Texture.from(canvas);
};

export class BokehBackground implements BackgroundRenderer {
  readonly view = new Container();
  private readonly base = new Graphics();
  private readonly particleLayer = new Container();
  private readonly color: number;
  private readonly tint: number;
  private readonly count: number;
  private readonly particles: Bokeh[] = [];
  private texture: Texture | null = null;
  private width = 0;
  private height = 0;

  constructor(spec: BackgroundSpec) {
    this.color = spec.color ?? DEFAULT_BACKGROUND_COLOR;
    this.tint = spec.bokehColor ?? 0xffffff;
    const density = Math.max(1, Math.min(10, spec.bokehDensity ?? 5));
    this.count = Math.round(density * PARTICLES_PER_DENSITY);
    this.view.addChild(this.base);
    this.view.addChild(this.particleLayer);
  }

  init(viewport: BackgroundViewport): void {
    this.width = viewport.w;
    this.height = viewport.h;
    this.texture = createSoftCircleTexture();
    this.paintBase();
    for (let i = 0; i < this.count; i++) {
      this.particles.push(this.spawn());
    }
  }

  update(deltaMs: number): void {
    const left = -BACKGROUND_OVERSCAN;
    const right = this.width + BACKGROUND_OVERSCAN;
    const top = -BACKGROUND_OVERSCAN;
    const bottom = this.height + BACKGROUND_OVERSCAN;
    for (const p of this.particles) {
      p.sprite.x += p.vx * deltaMs;
      p.sprite.y += p.vy * deltaMs;
      if (p.sprite.x < left) p.sprite.x = right;
      else if (p.sprite.x > right) p.sprite.x = left;
      if (p.sprite.y < top) p.sprite.y = bottom;
      else if (p.sprite.y > bottom) p.sprite.y = top;
      p.pulse += p.pulseSpeed * deltaMs;
      p.sprite.alpha = p.baseAlpha * (0.7 + 0.3 * Math.sin(p.pulse));
    }
  }

  resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.paintBase();
  }

  destroy(): void {
    this.texture?.destroy(true);
    this.texture = null;
    this.particles.length = 0;
    this.view.destroy({ children: true });
  }

  private paintBase(): void {
    this.base
      .clear()
      .rect(
        -BACKGROUND_OVERSCAN,
        -BACKGROUND_OVERSCAN,
        this.width + BACKGROUND_OVERSCAN * 2,
        this.height + BACKGROUND_OVERSCAN * 2,
      )
      .fill(this.color);
  }

  private spawn(): Bokeh {
    const sprite = new Sprite(this.texture ?? Texture.WHITE);
    sprite.anchor.set(0.5);
    sprite.tint = this.tint;
    const radius = MIN_RADIUS + Math.random() * RADIUS_RANGE;
    sprite.width = radius * 2;
    sprite.height = radius * 2;
    const spanW = this.width + BACKGROUND_OVERSCAN * 2;
    const spanH = this.height + BACKGROUND_OVERSCAN * 2;
    sprite.x = Math.random() * spanW - BACKGROUND_OVERSCAN;
    sprite.y = Math.random() * spanH - BACKGROUND_OVERSCAN;
    const baseAlpha = 0.08 + Math.random() * 0.22;
    sprite.alpha = baseAlpha;
    const angle = Math.random() * Math.PI * 2;
    const speed = DRIFT_MIN + Math.random() * DRIFT_RANGE;
    this.particleLayer.addChild(sprite);
    return {
      sprite,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      baseAlpha,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.0008 + Math.random() * 0.0016,
    };
  }
}
