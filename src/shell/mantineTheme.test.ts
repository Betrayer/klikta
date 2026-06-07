import { describe, expect, it } from "vitest";
import { buildMantineTheme } from "./mantineTheme";
import { DEFAULT_THEME } from "../data/themes";

describe("buildMantineTheme", () => {
  it("never overrides components with undefined (Mantine deepMerge would null out theme.components and crash useProps)", () => {
    const override = buildMantineTheme(DEFAULT_THEME);
    if ("components" in override) {
      expect(typeof override.components).toBe("object");
      expect(override.components).not.toBeNull();
    }
  });
});
