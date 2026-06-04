import { Container, Sprite } from "pixi.js";
import type { BackgroundSpec } from "../../../data/themes/types";
import {
  BACKGROUND_OVERSCAN,
  DEFAULT_BACKGROUND_COLOR,
  type BackgroundRenderer,
  type BackgroundViewport,
} from "../BackgroundRenderer";
import { VerticalGradientTexture } from "../gradientTexture";

export class GradientBackground implements BackgroundRenderer {
  readonly view = new Container();
  private readonly from: number;
  private readonly to: number;
  private gradient: VerticalGradientTexture | null = null;
  private sprite: Sprite | null = null;

  constructor(spec: BackgroundSpec) {
    const base = spec.color ?? DEFAULT_BACKGROUND_COLOR;
    this.from = spec.gradientFrom ?? base;
    this.to = spec.gradientTo ?? base;
  }

  init(viewport: BackgroundViewport): void {
    const gradient = new VerticalGradientTexture();
    gradient.paint(this.from, this.to);
    const sprite = new Sprite(gradient.texture);
    this.gradient = gradient;
    this.sprite = sprite;
    this.view.addChild(sprite);
    this.layout(viewport.w, viewport.h);
  }

  update(): void {}

  resize(w: number, h: number): void {
    this.layout(w, h);
  }

  destroy(): void {
    this.gradient?.destroy();
    this.gradient = null;
    this.sprite = null;
    this.view.destroy({ children: true });
  }

  private layout(w: number, h: number): void {
    if (this.sprite === null) return;
    this.sprite.position.set(-BACKGROUND_OVERSCAN, -BACKGROUND_OVERSCAN);
    this.sprite.width = w + BACKGROUND_OVERSCAN * 2;
    this.sprite.height = h + BACKGROUND_OVERSCAN * 2;
  }
}
