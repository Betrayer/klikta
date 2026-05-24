import { describe, expect, it } from "vitest";
import { getLeaderboardValue, sanitizeDisplayName } from "./leaderboard";

describe("getLeaderboardValue", () => {
  it("uses score for score-sorted modes", () => {
    expect(
      getLeaderboardValue("endless_hp", { score: 1200, durationMs: 45000 }),
    ).toBe(1200);
    expect(
      getLeaderboardValue("campaign", { score: 800, durationMs: 60000 }),
    ).toBe(800);
    expect(
      getLeaderboardValue("physics_chaos", { score: 500, durationMs: 30000 }),
    ).toBe(500);
  });

  it("uses duration for the time-attack mode", () => {
    expect(
      getLeaderboardValue("endless_timer", { score: 1200, durationMs: 45000 }),
    ).toBe(45000);
  });
});

describe("sanitizeDisplayName", () => {
  it("trims and caps length to 24 characters", () => {
    expect(sanitizeDisplayName("  Bohdan  ")).toBe("Bohdan");
    expect(sanitizeDisplayName("X".repeat(40))).toBe("X".repeat(24));
  });

  it("strips control characters", () => {
    expect(sanitizeDisplayName("abcde")).toBe("abcde");
    expect(sanitizeDisplayName("line\nbreak\tinjection")).toBe(
      "linebreakinjection",
    );
  });

  it("keeps unicode letters and emoji", () => {
    expect(sanitizeDisplayName("Богдан 🎮")).toBe("Богдан 🎮");
  });

  it("falls back to Player when empty after cleaning", () => {
    expect(sanitizeDisplayName("")).toBe("Player");
    expect(sanitizeDisplayName(" ")).toBe("Player");
  });
});
