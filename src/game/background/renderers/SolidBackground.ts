import { Container, Graphics } from "pixi.js";
import type { BackgroundSpec } from "../../../data/themes/types";
import {
  BACKGROUND_OVERSCAN,
  DEFAULT_BACKGROUND_COLOR,
  type BackgroundRenderer,
  type BackgroundViewport,
} from "../BackgroundRenderer";

export class SolidBackground implements BackgroundRenderer {
  readonly view = new Container();
  private readonly gfx = new Graphics();
  private readonly color: number;

  constructor(spec: BackgroundSpec) {
    this.color = spec.color ?? DEFAULT_BACKGROUND_COLOR;
    this.view.addChild(this.gfx);
  }

  init(viewport: BackgroundViewport): void {
    this.paint(viewport.w, viewport.h);
  }

  update(): void {}

  resize(w: number, h: number): void {
    this.paint(w, h);
  }

  destroy(): void {
    this.view.destroy({ children: true });
  }

  private paint(w: number, h: number): void {
    this.gfx
      .clear()
      .rect(
        -BACKGROUND_OVERSCAN,
        -BACKGROUND_OVERSCAN,
        w + BACKGROUND_OVERSCAN * 2,
        h + BACKGROUND_OVERSCAN * 2,
      )
      .fill(this.color);
  }
}
