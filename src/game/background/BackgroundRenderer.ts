import type { Container } from "pixi.js";

export interface BackgroundViewport {
  w: number;
  h: number;
}

export interface BackgroundRenderer {
  readonly view: Container;
  init(viewport: BackgroundViewport): void;
  update(deltaMs: number): void;
  resize(w: number, h: number): void;
  destroy(): void;
}

export const DEFAULT_BACKGROUND_COLOR = 0x1a0033;

export const BACKGROUND_OVERSCAN = 64;
