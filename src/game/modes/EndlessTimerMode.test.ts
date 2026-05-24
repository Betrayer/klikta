import { beforeEach, describe, expect, it } from "vitest";
import { useRunStore } from "../../state/runStore";
import {
  TIMER_BOMB_PENALTY_MS,
  TIMER_GAIN_BY_KIND,
  TIMER_INITIAL_MS,
} from "../config/balance";
import { EndlessTimerMode } from "./EndlessTimerMode";
import type { ModeContext } from "./ModePolicy";

const snapshot = (): ModeContext => {
  const s = useRunStore.getState();
  return {
    elapsedMs: s.elapsedMs,
    score: s.score,
    hp: s.hp,
    timeRemainingMs: s.timeRemainingMs,
    liveTargetCount: 0,
  };
};

describe("EndlessTimerMode", () => {
  let mode: EndlessTimerMode;

  beforeEach(() => {
    mode = new EndlessTimerMode();
    useRunStore.getState().startRun({
      mode: "endless_timer",
      initialTimeMs: mode.initialTimeMs,
    });
  });

  it("seeds the run timer from initialTimeMs", () => {
    expect(mode.initialTimeMs).toBe(TIMER_INITIAL_MS);
    expect(useRunStore.getState().timeRemainingMs).toBe(TIMER_INITIAL_MS);
  });

  it("depletes the timer by the tick delta", () => {
    mode.onTick(250);
    expect(useRunStore.getState().timeRemainingMs).toBe(TIMER_INITIAL_MS - 250);
  });

  it("adds time on a hit, scaled by target kind", () => {
    mode.onTick(1000);
    mode.onHit(snapshot(), "golden");
    expect(useRunStore.getState().timeRemainingMs).toBe(
      TIMER_INITIAL_MS - 1000 + TIMER_GAIN_BY_KIND.golden,
    );
  });

  it("never adds time for a bomb hit", () => {
    mode.onTick(1000);
    mode.onHit(snapshot(), "bomb");
    expect(useRunStore.getState().timeRemainingMs).toBe(
      TIMER_INITIAL_MS - 1000,
    );
  });

  it("costs time on a bomb click and never charges HP", () => {
    expect(mode.onBombClick()).toBe("none");
    expect(useRunStore.getState().timeRemainingMs).toBe(
      TIMER_INITIAL_MS - TIMER_BOMB_PENALTY_MS,
    );
  });

  it("never penalises a miss", () => {
    expect(mode.onMiss()).toBe("none");
  });

  it("is over only once the timer is spent", () => {
    expect(mode.isRunOver(snapshot())).toBe(false);
    mode.onTick(TIMER_INITIAL_MS);
    expect(useRunStore.getState().timeRemainingMs).toBe(0);
    expect(mode.isRunOver(snapshot())).toBe(true);
  });

  it("clamps the timer at zero rather than going negative", () => {
    mode.onTick(TIMER_INITIAL_MS + 5000);
    expect(useRunStore.getState().timeRemainingMs).toBe(0);
  });
});
