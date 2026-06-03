import { Assets, Sprite, Texture, type Container } from "pixi.js";
import type {
  TargetStateTextures,
  TargetVisual,
} from "../../../data/themes/types";
import type { TargetRenderer } from "./TargetRenderer";

export const resolveStateTexture = (
  states: TargetStateTextures | undefined,
  state: string,
): string | undefined => {
  if (states === undefined) return undefined;
  const direct = states[state as keyof TargetStateTextures];
  if (direct !== undefined) return direct;
  const match = /^(\D+)(\d+)$/.exec(state);
  if (match === null) return undefined;
  const prefix = match[1];
  const numeric = match[2];
  if (prefix === undefined || numeric === undefined) return undefined;
  for (let n = Number(numeric) - 1; n >= 1; n--) {
    const tex = states[`${prefix}${n}` as keyof TargetStateTextures];
    if (tex !== undefined) return tex;
  }
  return undefined;
};

export class SpriteRenderer implements TargetRenderer {
  build(visual: TargetVisual, size: number, state?: string | null): Container {
    const stateTexture =
      state !== undefined && state !== null
        ? resolveStateTexture(visual.states, state)
        : undefined;
    const key = stateTexture ?? visual.texture;
    const texture =
      key !== undefined ? (Assets.get<Texture>(key) ?? Texture.WHITE) : Texture.WHITE;
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.width = size * 2;
    sprite.height = size * 2;
    if (visual.tint !== undefined) sprite.tint = visual.tint;
    return sprite;
  }
}
