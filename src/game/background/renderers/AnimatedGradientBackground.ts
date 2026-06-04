import { Container, Texture, TilingSprite } from "pixi.js";
import type { BackgroundSpec } from "../../../data/themes/types";
import {
  BACKGROUND_OVERSCAN,
  DEFAULT_BACKGROUND_COLOR,
  type BackgroundRenderer,
  type BackgroundViewport,
} from "../BackgroundRenderer";

const DEFAULT_CYCLE_SEC = 8;
const STRIP_WIDTH = 64;
const STRIP_HEIGHT = 4096;
const BAYER_4X4 = [
  0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5,
] as const;

const bakeStrip = (stops: number[]): Texture => {
  const count = stops.length;
  const canvas = document.createElement("canvas");
  canvas.width = STRIP_WIDTH;
  canvas.height = STRIP_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (ctx === null) return Texture.WHITE;
  const image = ctx.createImageData(STRIP_WIDTH, STRIP_HEIGHT);
  const data = image.data;
  for (let y = 0; y < STRIP_HEIGHT; y++) {
    const phase = (y / STRIP_HEIGHT) * count;
    const seg = Math.floor(phase) % count;
    const f = phase - Math.floor(phase);
    const a = stops[seg] ?? DEFAULT_BACKGROUND_COLOR;
    const b = stops[(seg + 1) % count] ?? DEFAULT_BACKGROUND_COLOR;
    const r = ((a >> 16) & 0xff) + (((b >> 16) & 0xff) - ((a >> 16) & 0xff)) * f;
    const g = ((a >> 8) & 0xff) + (((b >> 8) & 0xff) - ((a >> 8) & 0xff)) * f;
    const bl = (a & 0xff) + ((b & 0xff) - (a & 0xff)) * f;
    for (let x = 0; x < STRIP_WIDTH; x++) {
      const threshold = (BAYER_4X4[(y & 3) * 4 + (x & 3)] ?? 0) / 16 - 0.5;
      const idx = (y * STRIP_WIDTH + x) * 4;
      data[idx] = r + threshold;
      data[idx + 1] = g + threshold;
      data[idx + 2] = bl + threshold;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return Texture.from(canvas);
};

export class AnimatedGradientBackground implements BackgroundRenderer {
  readonly view = new Container();
  private readonly stops: number[];
  private readonly stepMs: number;
  private texture: Texture | null = null;
  private sprite: TilingSprite | null = null;
  private segmentLocalPx = 0;

  constructor(spec: BackgroundSpec) {
    const base = spec.color ?? DEFAULT_BACKGROUND_COLOR;
    const stops = spec.colorStops ?? [];
    this.stops = stops.length >= 2 ? stops : [base, spec.gradientTo ?? base];
    this.stepMs = (spec.animationSpeedSec ?? DEFAULT_CYCLE_SEC) * 1000;
  }

  init(viewport: BackgroundViewport): void {
    const texture = bakeStrip(this.stops);
    const sprite = new TilingSprite({
      texture,
      width: viewport.w + BACKGROUND_OVERSCAN * 2,
      height: viewport.h + BACKGROUND_OVERSCAN * 2,
    });
    sprite.position.set(-BACKGROUND_OVERSCAN, -BACKGROUND_OVERSCAN);
    this.texture = texture;
    this.sprite = sprite;
    this.view.addChild(sprite);
    this.layout(viewport.w, viewport.h);
  }

  update(deltaMs: number): void {
    if (this.sprite === null) return;
    this.sprite.tilePosition.y +=
      (this.segmentLocalPx / this.stepMs) * deltaMs;
  }

  resize(w: number, h: number): void {
    this.layout(w, h);
  }

  destroy(): void {
    this.texture?.destroy(true);
    this.texture = null;
    this.sprite = null;
    this.view.destroy({ children: true });
  }

  private layout(w: number, h: number): void {
    if (this.sprite === null) return;
    const visibleH = h + BACKGROUND_OVERSCAN * 2;
    this.sprite.width = w + BACKGROUND_OVERSCAN * 2;
    this.sprite.height = visibleH;
    this.sprite.tileScale.set(1, (visibleH * this.stops.length) / STRIP_HEIGHT);
    this.segmentLocalPx = visibleH;
  }
}
