import { Graphics, type Container } from "pixi.js";
import type { TargetShape, TargetVisual } from "../../../data/themes/types";
import type { TargetRenderer } from "./TargetRenderer";

const STAR_SPIKES = 6;
const STAR_INNER_RATIO = 0.5;
const HEXAGON_SIDES = 6;
const FLOWER_PETALS = 6;

const drawStar = (g: Graphics, size: number, color: number): void => {
  const inner = size * STAR_INNER_RATIO;
  const points: number[] = [];
  for (let i = 0; i < STAR_SPIKES * 2; i++) {
    const radius = i % 2 === 0 ? size : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / STAR_SPIKES;
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  g.poly(points).fill(color);
};

const drawRegularPolygon = (
  g: Graphics,
  size: number,
  sides: number,
  color: number,
): void => {
  const points: number[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / sides;
    points.push(Math.cos(angle) * size, Math.sin(angle) * size);
  }
  g.poly(points).fill(color);
};

const drawFlower = (g: Graphics, size: number, color: number): void => {
  for (let i = 0; i < FLOWER_PETALS; i++) {
    const angle = (i * Math.PI * 2) / FLOWER_PETALS;
    g.circle(
      Math.cos(angle) * size * 0.55,
      Math.sin(angle) * size * 0.55,
      size * 0.45,
    ).fill(color);
  }
  g.circle(0, 0, size * 0.5).fill(color);
};

const drawShape = (
  g: Graphics,
  shape: TargetShape,
  size: number,
  color: number,
): void => {
  switch (shape) {
    case "circle":
      g.circle(0, 0, size).fill(color);
      return;
    case "star":
      drawStar(g, size, color);
      return;
    case "hexagon":
      drawRegularPolygon(g, size, HEXAGON_SIDES, color);
      return;
    case "roundedSquare":
      g.roundRect(-size, -size, size * 2, size * 2, size * 0.35).fill(color);
      return;
    case "flower":
      drawFlower(g, size, color);
      return;
  }
};

export class VectorRenderer implements TargetRenderer {
  build(visual: TargetVisual, size: number): Container {
    const g = new Graphics();
    drawShape(g, visual.shape ?? "circle", size, visual.color ?? 0xffffff);
    return g;
  }
}
