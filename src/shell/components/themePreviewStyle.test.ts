import { describe, expect, it } from "vitest";
import { backgroundCss } from "./themePreviewStyle";

describe("backgroundCss", () => {
  it("renders a solid background as a hex color", () => {
    expect(backgroundCss({ kind: "solid", color: 0x1a0033 })).toBe("#1a0033");
  });

  it("builds a multi-stop gradient for animated backgrounds", () => {
    const css = backgroundCss({
      kind: "animated_gradient",
      colorStops: [0x000000, 0xffffff],
    });
    expect(css).toContain("linear-gradient");
    expect(css).toContain("#000000");
    expect(css).toContain("#ffffff");
  });

  it("layers soft dots over a base color for bokeh", () => {
    const css = backgroundCss({
      kind: "bokeh",
      color: 0x2a0f1f,
      bokehColor: 0xffd0e0,
    });
    expect(css).toContain("radial-gradient");
    expect(css).toContain("#2a0f1f");
    expect(css).toContain("#ffd0e0");
  });

  it("falls back to the base color for image and noise kinds", () => {
    expect(backgroundCss({ kind: "noise", color: 0x123456 })).toBe("#123456");
  });
});
