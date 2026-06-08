import { describe, expect, it } from "vitest";
import { resolveCursorValue } from "../data/themes/cursorTextures";

describe("resolveCursorValue", () => {
  it("returns undefined when no cursor key is set", () => {
    expect(resolveCursorValue(undefined, {})).toBeUndefined();
  });

  it("returns undefined when the key is missing from the registry", () => {
    expect(resolveCursorValue("bloom", {})).toBeUndefined();
  });

  it("builds a css cursor value when the key resolves", () => {
    expect(resolveCursorValue("bloom", { bloom: "/cursors/bloom.png" })).toBe(
      "url(/cursors/bloom.png), auto",
    );
  });
});
