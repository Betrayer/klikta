import {
  Circle,
  Graphics,
  Polygon,
  RoundedRectangle,
  type Container,
} from "pixi.js";
import type { TargetShape, TargetVisual } from "../../../data/themes/types";
import type { TargetRenderer } from "./TargetRenderer";

const STAR_SPIKES = 6;
const STAR_INNER_RATIO = 0.5;
const HEXAGON_SIDES = 6;
const FLOWER_PETALS = 6;
const ROUNDED_CORNER_RATIO = 0.35;

const GLOW_STEPS = [
  { scale: 1.5, alpha: 0.05 },
  { scale: 1.34, alpha: 0.08 },
  { scale: 1.2, alpha: 0.12 },
  { scale: 1.09, alpha: 0.18 },
];

const SHEEN_STEPS = [
  { scale: 0.66, lighten: 0.35, alpha: 0.5 },
  { scale: 0.34, lighten: 0.7, alpha: 0.55 },
];

const lighten = (color: number, amount: number): number => {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;
  const mix = (c: number): number => Math.round(c + (255 - c) * amount);
  return (mix(r) << 16) | (mix(g) << 8) | mix(b);
};

const starPoints = (size: number): number[] => {
  const inner = size * STAR_INNER_RATIO;
  const points: number[] = [];
  for (let i = 0; i < STAR_SPIKES * 2; i++) {
    const radius = i % 2 === 0 ? size : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / STAR_SPIKES;
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  return points;
};

const polygonPoints = (size: number, sides: number): number[] => {
  const points: number[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / sides;
    points.push(Math.cos(angle) * size, Math.sin(angle) * size);
  }
  return points;
};

const traceShape = (g: Graphics, shape: TargetShape, size: number): void => {
  switch (shape) {
    case "circle":
      g.circle(0, 0, size);
      return;
    case "star":
      g.poly(starPoints(size));
      return;
    case "hexagon":
      g.poly(polygonPoints(size, HEXAGON_SIDES));
      return;
    case "roundedSquare":
      g.roundRect(-size, -size, size * 2, size * 2, size * ROUNDED_CORNER_RATIO);
      return;
    case "flower":
      for (let i = 0; i < FLOWER_PETALS; i++) {
        const angle = (i * Math.PI * 2) / FLOWER_PETALS;
        g.circle(
          Math.cos(angle) * size * 0.55,
          Math.sin(angle) * size * 0.55,
          size * 0.45,
        );
      }
      g.circle(0, 0, size * 0.5);
      return;
  }
};

const hitAreaFor = (shape: TargetShape, size: number) => {
  switch (shape) {
    case "star":
      return new Polygon(starPoints(size));
    case "hexagon":
      return new Polygon(polygonPoints(size, HEXAGON_SIDES));
    case "roundedSquare":
      return new RoundedRectangle(
        -size,
        -size,
        size * 2,
        size * 2,
        size * ROUNDED_CORNER_RATIO,
      );
    case "circle":
    case "flower":
      return new Circle(0, 0, size);
  }
};

export class VectorRenderer implements TargetRenderer {
  build(visual: TargetVisual, size: number): Container {
    const shape = visual.shape ?? "circle";
    const color = visual.color ?? 0xffffff;
    const g = new Graphics();

    for (const step of GLOW_STEPS) {
      traceShape(g, shape, size * step.scale);
      g.fill({ color, alpha: step.alpha });
    }

    traceShape(g, shape, size);
    g.fill(color);

    for (const step of SHEEN_STEPS) {
      traceShape(g, shape, size * step.scale);
      g.fill({ color: lighten(color, step.lighten), alpha: step.alpha });
    }

    traceShape(g, shape, size);
    g.stroke({
      color: lighten(color, 0.35),
      width: Math.max(size * 0.07, 1.5),
      alpha: 0.7,
    });

    g.hitArea = hitAreaFor(shape, size);
    return g;
  }
}
