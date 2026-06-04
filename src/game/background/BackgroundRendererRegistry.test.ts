import { describe, expect, it } from "vitest";
import {
  createBackgroundRenderer,
  registerBackgroundRenderer,
} from "./BackgroundRendererRegistry";
import { SolidBackground } from "./renderers/SolidBackground";
import { GradientBackground } from "./renderers/GradientBackground";
import { ImageBackground } from "./renderers/ImageBackground";
import { AnimatedGradientBackground } from "./renderers/AnimatedGradientBackground";
import { BokehBackground } from "./renderers/BokehBackground";
import { NoiseBackground } from "./renderers/NoiseBackground";

describe("background renderer registry", () => {
  it("maps each built-in kind to its renderer", () => {
    expect(createBackgroundRenderer({ kind: "solid" })).toBeInstanceOf(
      SolidBackground,
    );
    expect(createBackgroundRenderer({ kind: "gradient" })).toBeInstanceOf(
      GradientBackground,
    );
    expect(createBackgroundRenderer({ kind: "image" })).toBeInstanceOf(
      ImageBackground,
    );
    expect(
      createBackgroundRenderer({ kind: "animated_gradient" }),
    ).toBeInstanceOf(AnimatedGradientBackground);
    expect(createBackgroundRenderer({ kind: "bokeh" })).toBeInstanceOf(
      BokehBackground,
    );
    expect(createBackgroundRenderer({ kind: "noise" })).toBeInstanceOf(
      NoiseBackground,
    );
  });

  it("falls back to solid for an unregistered custom renderer", () => {
    const renderer = createBackgroundRenderer({
      kind: "custom",
      customRenderer: "does-not-exist",
    });
    expect(renderer).toBeInstanceOf(SolidBackground);
  });

  it("uses a registered custom renderer factory", () => {
    registerBackgroundRenderer("test-gradient", (spec) => new GradientBackground(spec));
    const renderer = createBackgroundRenderer({
      kind: "custom",
      customRenderer: "test-gradient",
    });
    expect(renderer).toBeInstanceOf(GradientBackground);
  });
});
