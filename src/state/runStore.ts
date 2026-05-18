import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type RunStatus = "idle" | "playing" | "gameOver";

export interface RunState {
  status: RunStatus;
  score: number;
  hp: number;
  combo: number;
  maxCombo: number;
  elapsedMs: number;
  startRun: () => void;
  registerHit: (baseScore: number) => void;
  resetCombo: () => void;
  loseHP: () => void;
  tickElapsed: (ms: number) => void;
  reset: () => void;
}

const INITIAL_HP = 3;

const freshRun = {
  score: 0,
  hp: INITIAL_HP,
  combo: 0,
  maxCombo: 0,
  elapsedMs: 0,
};

export const COMBO_MILESTONES: readonly number[] = [10, 25, 50, 100];

export const comboMultiplier = (combo: number): number => {
  if (combo >= 100) return 5;
  if (combo >= 50) return 4;
  if (combo >= 30) return 3;
  if (combo >= 15) return 2;
  if (combo >= 5) return 1.5;
  return 1;
};

export const useRunStore = create<RunState>()(
  devtools(
    (set) => ({
      status: "idle",
      ...freshRun,
      startRun: () =>
        set({ status: "playing", ...freshRun }, false, "startRun"),
      registerHit: (baseScore) =>
        set(
          (s) => {
            const combo = s.combo + 1;
            const gained = Math.round(baseScore * comboMultiplier(combo));
            return {
              combo,
              maxCombo: Math.max(s.maxCombo, combo),
              score: s.score + gained,
            };
          },
          false,
          "registerHit",
        ),
      resetCombo: () =>
        set((s) => (s.combo === 0 ? s : { combo: 0 }), false, "resetCombo"),
      loseHP: () =>
        set(
          (s) => {
            if (s.hp <= 0) return s;
            const hp = s.hp - 1;
            return hp <= 0 ? { hp: 0, status: "gameOver" } : { hp };
          },
          false,
          "loseHP",
        ),
      tickElapsed: (ms) =>
        set((s) => ({ elapsedMs: s.elapsedMs + ms }), false, "tickElapsed"),
      reset: () => set({ status: "idle", ...freshRun }, false, "reset"),
    }),
    { name: "runStore" },
  ),
);
