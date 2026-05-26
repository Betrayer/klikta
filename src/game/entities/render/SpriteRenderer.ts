import { Assets, Sprite, Texture, type Container } from "pixi.js";
import type { TargetVisual } from "../../../data/themes/types";
import type { TargetRenderer } from "./TargetRenderer";

export class SpriteRenderer implements TargetRenderer {
  build(visual: TargetVisual, size: number): Container {
    const texture =
      visual.texture !== undefined
        ? (Assets.get<Texture>(visual.texture) ?? Texture.WHITE)
        : Texture.WHITE;
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.width = size * 2;
    sprite.height = size * 2;
    if (visual.tint !== undefined) sprite.tint = visual.tint;
    return sprite;
  }
}
