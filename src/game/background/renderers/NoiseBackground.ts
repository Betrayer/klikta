import { Container, Graphics, Texture, TilingSprite } from "pixi.js";
import type { BackgroundSpec } from "../../../data/themes/types";
import {
  BACKGROUND_OVERSCAN,
  DEFAULT_BACKGROUND_COLOR,
  type BackgroundRenderer,
  type BackgroundViewport,
} from "../BackgroundRenderer";

const NOISE_TEX_SIZE = 128;
const DEFAULT_DRIFT_SEC = 6;
const OVERLAY_ALPHA = 0.12;

const createNoiseTexture = (): Texture => {
  const canvas = document.createElement("canvas");
  canvas.width = NOISE_TEX_SIZE;
  canvas.height = NOISE_TEX_SIZE;
  const ctx = canvas.getContext("2d");
  if (ctx === null) return Texture.WHITE;
  const image = ctx.createImageData(NOISE_TEX_SIZE, NOISE_TEX_SIZE);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = Math.floor(Math.random() * 256);
    image.data[i] = value;
    image.data[i + 1] = value;
    image.data[i + 2] = value;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return Texture.from(canvas);
};

export class NoiseBackground implements BackgroundRenderer {
  readonly view = new Container();
  private readonly base = new Graphics();
  private readonly color: number;
  private readonly tint: number;
  private readonly driftPerMs: number;
  private texture: Texture | null = null;
  private overlay: TilingSprite | null = null;
  private width = 0;
  private height = 0;

  constructor(spec: BackgroundSpec) {
    this.color = spec.color ?? DEFAULT_BACKGROUND_COLOR;
    this.tint = spec.bokehColor ?? 0xffffff;
    const driftSec = spec.animationSpeedSec ?? DEFAULT_DRIFT_SEC;
    this.driftPerMs = NOISE_TEX_SIZE / (driftSec * 1000);
    this.view.addChild(this.base);
  }

  init(viewport: BackgroundViewport): void {
    this.width = viewport.w;
    this.height = viewport.h;
    this.texture = createNoiseTexture();
    const overlay = new TilingSprite({
      texture: this.texture,
      width: viewport.w + BACKGROUND_OVERSCAN * 2,
      height: viewport.h + BACKGROUND_OVERSCAN * 2,
    });
    overlay.position.set(-BACKGROUND_OVERSCAN, -BACKGROUND_OVERSCAN);
    overlay.tint = this.tint;
    overlay.alpha = OVERLAY_ALPHA;
    this.overlay = overlay;
    this.view.addChild(overlay);
    this.paintBase();
  }

  update(deltaMs: number): void {
    if (this.overlay === null) return;
    this.overlay.tilePosition.x += this.driftPerMs * deltaMs;
    this.overlay.tilePosition.y += this.driftPerMs * 0.5 * deltaMs;
  }

  resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    if (this.overlay !== null) {
      this.overlay.width = w + BACKGROUND_OVERSCAN * 2;
      this.overlay.height = h + BACKGROUND_OVERSCAN * 2;
    }
    this.paintBase();
  }

  destroy(): void {
    this.texture?.destroy(true);
    this.texture = null;
    this.overlay = null;
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
}
