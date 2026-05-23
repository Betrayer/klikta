import { describe, expect, it } from "vitest";
import { migrateMeta } from "./metaStore";

describe("migrateMeta", () => {
  it("moves a v1 bestScore into bestScores.endless_hp", () => {
    expect(
      migrateMeta({ bestScore: 4200, currency: 50 }, 1).bestScores,
    ).toEqual({
      endless_hp: 4200,
    });
  });

  it("preserves all other v1 fields", () => {
    const v1 = {
      currency: 120,
      totalEarnedCurrency: 500,
      selectedPerks: { reaction_t1: "steady_hands" },
      unlockedUltimates: ["bloom"],
      runsCompleted: 9,
      totalRunScore: 12345,
      bestScore: 4200,
      achievements: ["first_blood"],
    };
    const r = migrateMeta(v1, 1);
    expect(r.currency).toBe(120);
    expect(r.totalEarnedCurrency).toBe(500);
    expect(r.selectedPerks).toEqual({ reaction_t1: "steady_hands" });
    expect(r.unlockedUltimates).toEqual(["bloom"]);
    expect(r.runsCompleted).toBe(9);
    expect(r.totalRunScore).toBe(12345);
    expect(r.achievements).toEqual(["first_blood"]);
  });

  it("drops the legacy bestScore key from the persisted blob", () => {
    const r = migrateMeta({ bestScore: 4200 }, 1) as unknown as Record<
      string,
      unknown
    >;
    expect(r.bestScore).toBeUndefined();
  });

  it("yields empty bestScores when legacy best is 0", () => {
    expect(migrateMeta({ bestScore: 0 }, 1).bestScores).toEqual({});
  });

  it("yields empty bestScores when v1 never recorded a score", () => {
    expect(migrateMeta({ currency: 0 }, 1).bestScores).toEqual({});
  });

  it("is a no-op for already-migrated v2 state", () => {
    expect(
      migrateMeta({ bestScores: { endless_hp: 9000, campaign: 30 } }, 2)
        .bestScores,
    ).toEqual({ endless_hp: 9000, campaign: 30 });
  });

  it("never throws on null or undefined persisted input", () => {
    expect(migrateMeta(null, 1).bestScores).toEqual({});
    expect(migrateMeta(undefined, 0).bestScores).toEqual({});
  });
});
