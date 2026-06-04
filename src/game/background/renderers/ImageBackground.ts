import { Assets, Container, Sprite, Texture } from "pixi.js";
import type { BackgroundSpec } from "../../../data/themes/types";
import {
  BACKGROUND_OVERSCAN,
  type BackgroundRenderer,
  type BackgroundViewport,
} from "../BackgroundRenderer";

export class ImageBackground implements BackgroundRenderer {
  readonly view = new Container();
  private readonly textureKey: string | undefined;
  private sprite: Sprite | null = null;
  private width = 0;
  private height = 0;

  constructor(spec: BackgroundSpec) {
    this.textureKey = spec.texture;
  }

  init(viewport: BackgroundViewport): void {
    const texture =
      this.textureKey !== undefined
        ? (Assets.get<Texture>(this.textureKey) ?? Texture.WHITE)
        : Texture.WHITE;
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
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
    const texture = this.sprite.texture;
    const tw = texture.width || 1;
    const th = texture.height || 1;
    const targetW = this.width + BACKGROUND_OVERSCAN * 2;
    const targetH = this.height + BACKGROUND_OVERSCAN * 2;
    const scale = Math.max(targetW / tw, targetH / th);
    this.sprite.scale.set(scale);
    this.sprite.position.set(this.width / 2, this.height / 2);
  }
}
