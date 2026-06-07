import { beforeAll, describe, expect, it } from "vitest";
import { initI18n } from "./index";
import { localize } from "./localize";

describe("localize", () => {
  beforeAll(async () => {
    await initI18n("en");
  });

  it("falls back to the inline value when the key is missing", () => {
    expect(localize("perks", "no-such-perk-id", "name", "Fallback")).toBe(
      "Fallback",
    );
  });

  it("returns the en value when the key exists", () => {
    expect(localize("modes", "endless_hp", "name", "ignored")).toBe("Endless");
  });

  it("never returns a raw resolution key", () => {
    const value = localize("perks", "no-such-perk-id", "name", "Fallback");
    expect(value).not.toBe("perks:no-such-perk-id.name");
  });
});
