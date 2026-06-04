import { describe, expect, it } from "vitest";
import { resolveStateTexture } from "./SpriteRenderer";

describe("resolveStateTexture", () => {
  it("returns undefined when the theme declares no states", () => {
    expect(resolveStateTexture(undefined, "shield_up")).toBeUndefined();
  });

  it("returns the exact texture for a declared state", () => {
    const states = { shield_up: "up", shield_down: "down" };
    expect(resolveStateTexture(states, "shield_up")).toBe("up");
    expect(resolveStateTexture(states, "shield_down")).toBe("down");
  });

  it("falls back to the nearest lower numbered state", () => {
    const states = { multi_3: "m3", multi_1: "m1" };
    expect(resolveStateTexture(states, "multi_3")).toBe("m3");
    expect(resolveStateTexture(states, "multi_2")).toBe("m1");
    expect(resolveStateTexture(states, "multi_1")).toBe("m1");
  });

  it("returns undefined when no lower numbered state is declared", () => {
    const states = { multi_3: "m3" };
    expect(resolveStateTexture(states, "multi_1")).toBeUndefined();
  });

  it("clamps a higher click count down to the highest declared state", () => {
    const states = { multi_2: "m2", multi_1: "m1" };
    expect(resolveStateTexture(states, "multi_5")).toBe("m2");
  });

  it("returns undefined for an unrelated state key", () => {
    const states = { multi_2: "m2" };
    expect(resolveStateTexture(states, "shield_up")).toBeUndefined();
  });
});
