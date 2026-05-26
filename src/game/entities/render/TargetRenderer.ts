import type { Container } from "pixi.js";
import type {
  TargetRenderMode,
  TargetVisual,
} from "../../../data/themes/types";
import { VectorRenderer } from "./VectorRenderer";
import { SpriteRenderer } from "./SpriteRenderer";

export interface TargetRenderer {
  build(visual: TargetVisual, size: number): Container;
}

const vectorRenderer = new VectorRenderer();
const spriteRenderer = new SpriteRenderer();

export const rendererFor = (mode: TargetRenderMode): TargetRenderer =>
  mode === "sprite" ? spriteRenderer : vectorRenderer;
