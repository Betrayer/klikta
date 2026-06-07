import {
  Assets,
  Circle,
  Sprite,
  Texture,
  type Container,
  type IHitArea,
} from "pixi.js";
import type {
  TargetStateTextures,
  TargetVisual,
} from "../../../data/themes/types";
import type { TargetRenderer } from "./TargetRenderer";

const ALPHA_THRESHOLD = 8;
const MIN_ALPHA_DIM = 4;

const hitAreaCache = new WeakMap<Texture, IHitArea>();

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

const extractAlphaHitArea = (texture: Texture): IHitArea | null => {
  const orig = texture.orig;
  const frame = texture.frame;
  const w = Math.round(orig.width);
  const h = Math.round(orig.height);
  if (w < MIN_ALPHA_DIM || h < MIN_ALPHA_DIM) return null;
  if (Math.round(frame.width) !== w || Math.round(frame.height) !== h) {
    return null;
  }
  const resource = texture.source?.resource as CanvasImageSource | undefined;
  if (resource === undefined || resource === null) return null;
  if (typeof document === "undefined") return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx === null) return null;
    ctx.drawImage(
      resource,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      0,
      0,
      w,
      h,
    );
    const rgba = ctx.getImageData(0, 0, w, h).data;
    const alpha = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) alpha[i] = rgba[i * 4 + 3] ?? 0;
    return {
      contains(x: number, y: number): boolean {
        const px = Math.floor(x + w / 2);
        const py = Math.floor(y + h / 2);
        if (px < 0 || py < 0 || px >= w || py >= h) return false;
        return (alpha[py * w + px] ?? 0) > ALPHA_THRESHOLD;
      },
    };
  } catch {
    return null;
  }
};

const hitAreaForTexture = (texture: Texture): IHitArea => {
  const cached = hitAreaCache.get(texture);
  if (cached !== undefined) return cached;
  const radius = Math.min(texture.orig.width, texture.orig.height) / 2;
  const area = extractAlphaHitArea(texture) ?? new Circle(0, 0, radius);
  hitAreaCache.set(texture, area);
  return area;
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
    sprite.hitArea = hitAreaForTexture(texture);
    return sprite;
  }
}
