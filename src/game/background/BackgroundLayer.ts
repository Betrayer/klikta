import { Container } from "pixi.js";
import type { BackgroundSpec } from "../../data/themes/types";
import type {
  BackgroundRenderer,
  BackgroundViewport,
} from "./BackgroundRenderer";
import { createBackgroundRenderer } from "./BackgroundRendererRegistry";
import { SolidBackground } from "./renderers/SolidBackground";

export class BackgroundLayer {
  readonly view = new Container();
  private renderer: BackgroundRenderer;
  private viewport: BackgroundViewport;

  constructor(spec: BackgroundSpec, viewport: BackgroundViewport) {
    this.view.eventMode = "none";
    this.viewport = viewport;
    this.renderer = this.mount(spec);
  }

  applySpec(spec: BackgroundSpec): void {
    this.view.removeChild(this.renderer.view);
    this.renderer.destroy();
    this.renderer = this.mount(spec);
  }

  update(deltaMs: number): void {
    this.renderer.update(deltaMs);
  }

  resize(w: number, h: number): void {
    this.viewport = { w, h };
    this.renderer.resize(w, h);
  }

  destroy(): void {
    this.view.removeChild(this.renderer.view);
    this.renderer.destroy();
    this.view.destroy({ children: true });
  }

  private mount(spec: BackgroundSpec): BackgroundRenderer {
    const renderer = this.instantiate(spec);
    this.view.addChild(renderer.view);
    return renderer;
  }

  private instantiate(spec: BackgroundSpec): BackgroundRenderer {
    try {
      const renderer = createBackgroundRenderer(spec);
      renderer.init(this.viewport);
      return renderer;
    } catch {
      const fallback = new SolidBackground({ kind: "solid", color: spec.color });
      fallback.init(this.viewport);
      return fallback;
    }
  }
}
