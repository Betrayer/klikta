import { describe, expect, it } from "vitest";
import { SKILL_TREE } from "../../../data/skillTree";
import { isPerkIconName } from "./perkIconNames";

describe("perk icons", () => {
  it("every perk references a known icon name", () => {
    for (const branch of SKILL_TREE) {
      for (const tier of branch.tiers) {
        for (const option of tier.options) {
          expect(
            isPerkIconName(option.icon),
            `${option.id} -> "${option.icon}"`,
          ).toBe(true);
        }
      }
    }
  });
});
