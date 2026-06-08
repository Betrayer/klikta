import type { BackgroundSpec } from "../../data/themes/types";
import type { BackgroundRenderer } from "./BackgroundRenderer";
import { SolidBackground } from "./renderers/SolidBackground";
import { GradientBackground } from "./renderers/GradientBackground";
import { ImageBackground } from "./renderers/ImageBackground";
import { TiledBackground } from "./renderers/TiledBackground";
import { AnimatedGradientBackground } from "./renderers/AnimatedGradientBackground";
import { BokehBackground } from "./renderers/BokehBackground";
import { NoiseBackground } from "./renderers/NoiseBackground";

export type BackgroundRendererFactory = (
  spec: BackgroundSpec,
) => BackgroundRenderer;

const customRenderers = new Map<string, BackgroundRendererFactory>();

export const registerBackgroundRenderer = (
  key: string,
  factory: BackgroundRendererFactory,
): void => {
  customRenderers.set(key, factory);
};

export const createBackgroundRenderer = (
  spec: BackgroundSpec,
): BackgroundRenderer => {
  switch (spec.kind) {
    case "solid":
      return new SolidBackground(spec);
    case "gradient":
      return new GradientBackground(spec);
    case "image":
      return new ImageBackground(spec);
    case "tiled":
      return new TiledBackground(spec);
    case "animated_gradient":
      return new AnimatedGradientBackground(spec);
    case "bokeh":
      return new BokehBackground(spec);
    case "noise":
      return new NoiseBackground(spec);
    case "custom": {
      const factory =
        spec.customRenderer !== undefined
          ? customRenderers.get(spec.customRenderer)
          : undefined;
      return factory !== undefined ? factory(spec) : new SolidBackground(spec);
    }
  }
};
