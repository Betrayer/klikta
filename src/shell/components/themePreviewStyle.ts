import type { BackgroundSpec, TargetVisual } from "../../data/themes/types";

const toHex = (value: number): string =>
  `#${(value & 0xffffff).toString(16).padStart(6, "0")}`;

export const backgroundCss = (bg: BackgroundSpec): string => {
  switch (bg.kind) {
    case "solid":
      return toHex(bg.color ?? 0x101018);
    case "gradient":
      return `linear-gradient(135deg, ${toHex(bg.gradientFrom ?? bg.color ?? 0x101018)}, ${toHex(bg.gradientTo ?? 0x000000)})`;
    case "animated_gradient": {
      const stops =
        bg.colorStops !== undefined && bg.colorStops.length > 0
          ? bg.colorStops
          : [bg.color ?? 0x101018];
      return `linear-gradient(135deg, ${stops.map(toHex).join(", ")})`;
    }
    case "bokeh": {
      const base = toHex(bg.color ?? 0x101018);
      const dot = toHex(bg.bokehColor ?? 0xffffff);
      return `radial-gradient(circle at 28% 32%, ${dot}40, transparent 42%), radial-gradient(circle at 72% 68%, ${dot}2e, transparent 38%), ${base}`;
    }
    case "image":
    case "tiled":
    case "noise":
    case "custom":
      return toHex(bg.color ?? 0x101018);
  }
};

export const targetDotColor = (visual: TargetVisual): string =>
  toHex(visual.color ?? 0xffffff);
