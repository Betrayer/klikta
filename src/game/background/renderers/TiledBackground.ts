import { Assets, Container, Texture, TilingSprite } from "pixi.js";
import type { BackgroundSpec } from "../../../data/themes/types";
import {
  BACKGROUND_OVERSCAN,
  type BackgroundRenderer,
  type BackgroundViewport,
} from "../BackgroundRenderer";

export class TiledBackground implements BackgroundRenderer {
  readonly view = new Container();
  private readonly textureKey: string | undefined;
  private readonly tileScale: number;
  private sprite: TilingSprite | null = null;
  private width = 0;
  private height = 0;

  constructor(spec: BackgroundSpec) {
    this.textureKey = spec.texture;
    this.tileScale = spec.tileScale ?? 1;
  }

  init(viewport: BackgroundViewport): void {
    const texture =
      this.textureKey !== undefined
        ? (Assets.get<Texture>(this.textureKey) ?? Texture.WHITE)
        : Texture.WHITE;
    const sprite = new TilingSprite({
      texture,
      tileScale: { x: this.tileScale, y: this.tileScale },
    });
    this.sprite = sprite;
    this.view.addChild(sprite);
    this.width = viewport.w;
    this.height = viewport.h;
    this.layout();
  }

  update(): void {}

  resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.layout();
  }

  destroy(): void {
    this.sprite = null;
    this.view.destroy({ children: true });
  }

  private layout(): void {
    if (this.sprite === null) return;
    this.sprite.position.set(-BACKGROUND_OVERSCAN, -BACKGROUND_OVERSCAN);
    this.sprite.width = this.width + BACKGROUND_OVERSCAN * 2;
    this.sprite.height = this.height + BACKGROUND_OVERSCAN * 2;
  }
}
