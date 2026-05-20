import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type RunStatus = "idle" | "playing" | "gameOver";

export interface StartRunOptions {
  startingHPAdd?: number;
  comboCap?: number;
}

export interface RunState {
  status: RunStatus;
  score: number;
  hp: number;
  maxHp: number;
  combo: number;
  maxCombo: number;
  comboCap: number;
  elapsedMs: number;
  paused: boolean;
  startRun: (opts?: StartRunOptions) => void;
  registerHit: (baseScore: number) => void;
  resetCombo: () => void;
  loseHP: () => void;
  loseHPBy: (amount: number) => void;
  healHP: (amount: number) => void;
  fullHeal: () => void;
  tickElapsed: (ms: number) => void;
  setPaused: (paused: boolean) => void;
  reset: () => void;
}

const BASE_HP = 3;
const DEFAULT_COMBO_CAP = 5;

const freshRun = {
  score: 0,
  hp: BASE_HP,
  maxHp: BASE_HP,
  combo: 0,
  maxCombo: 0,
  comboCap: DEFAULT_COMBO_CAP,
  elapsedMs: 0,
  paused: false,
};

export const COMBO_MILESTONES: readonly number[] = [10, 25, 50, 100];

const baseComboCurve = (combo: number): number => {
  if (combo >= 250) return 8;
  if (combo >= 200) return 7;
  if (combo >= 150) return 6;
  if (combo >= 100) return 5;
  if (combo >= 50) return 4;
  if (combo >= 30) return 3;
  if (combo >= 15) return 2;
  if (combo >= 5) return 1.5;
  return 1;
};

export const comboMultiplier = (
  combo: number,
  cap = DEFAULT_COMBO_CAP,
): number => Math.min(baseComboCurve(combo), cap);

const clampHP = (hp: number, max: number): number =>
  Math.max(0, Math.min(hp, max));

export const useRunStore = create<RunState>()(
  devtools(
    (set) => ({
      status: "idle",
      ...freshRun,
      startRun: (opts) => {
        const add = opts?.startingHPAdd ?? 0;
        const cap = opts?.comboCap ?? DEFAULT_COMBO_CAP;
        const maxHp = BASE_HP + Math.max(0, add);
        set(
          {
            status: "playing",
            ...freshRun,
            hp: maxHp,
            maxHp,
            comboCap: cap,
          },
          false,
          "startRun",
        );
      },
      registerHit: (baseScore) =>
        set(
          (s) => {
            const combo = s.combo + 1;
            const gained = Math.round(
              baseScore * comboMultiplier(combo, s.comboCap),
            );
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
      loseHPBy: (amount) =>
        set(
          (s) => {
            if (s.hp <= 0 || amount <= 0) return s;
            const hp = s.hp - amount;
            return hp <= 0 ? { hp: 0, status: "gameOver" } : { hp };
          },
          false,
          "loseHPBy",
        ),
      healHP: (amount) =>
        set(
          (s) => {
            if (s.hp <= 0 || amount <= 0) return s;
            const hp = clampHP(s.hp + amount, s.maxHp);
            return hp === s.hp ? s : { hp };
          },
          false,
          "healHP",
        ),
      fullHeal: () =>
        set((s) => (s.hp === s.maxHp ? s : { hp: s.maxHp }), false, "fullHeal"),
      tickElapsed: (ms) =>
        set((s) => ({ elapsedMs: s.elapsedMs + ms }), false, "tickElapsed"),
      setPaused: (paused) =>
        set((s) => (s.paused === paused ? s : { paused }), false, "setPaused"),
      reset: () => set({ status: "idle", ...freshRun }, false, "reset"),
    }),
    { name: "runStore" },
  ),
);
