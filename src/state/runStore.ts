import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type RunStatus = "idle" | "playing" | "gameOver";

export interface RunState {
  status: RunStatus;
  score: number;
  hp: number;
  elapsedMs: number;
  startRun: () => void;
  addScore: (n: number) => void;
  loseHP: () => void;
  tickElapsed: (ms: number) => void;
  reset: () => void;
}

const INITIAL_HP = 3;

const freshRun = {
  score: 0,
  hp: INITIAL_HP,
  elapsedMs: 0,
};

export const useRunStore = create<RunState>()(
  devtools(
    (set) => ({
      status: "idle",
      ...freshRun,
      startRun: () =>
        set({ status: "playing", ...freshRun }, false, "startRun"),
      addScore: (n) => set((s) => ({ score: s.score + n }), false, "addScore"),
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
