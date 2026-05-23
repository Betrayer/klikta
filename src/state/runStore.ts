import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { BASE_HP, DEFAULT_COMBO_CAP } from "../game/config/balance";
import type { ModeId } from "../data/modes";
import { DEFAULT_MODE } from "../data/modes";

export type RunStatus = "idle" | "playing" | "gameOver";

export interface StartRunOptions {
  mode?: ModeId;
  startingHPAdd?: number;
  comboCap?: number;
  initialTimeMs?: number;
}

export interface AchievementAward {
  id: string;
  amount: number;
}

export interface CurrencyBreakdown {
  base: number;
  comboBonus: number;
  bombBounty: number;
  comboCoin: number;
  achievements: AchievementAward[];
  total: number;
}

export interface RunResults {
  currencyEarned: number;
  currencyBreakdown: CurrencyBreakdown;
  previousBestScore: number;
}

export interface RunState {
  status: RunStatus;
  mode: ModeId;
  score: number;
  hp: number;
  maxHp: number;
  combo: number;
  maxCombo: number;
  comboCap: number;
  elapsedMs: number;
  timeRemainingMs: number;
  paused: boolean;
  timePulseIncoming: boolean;
  bombClicksThisRun: number;
  currencyEarned: number;
  currencyBreakdown: CurrencyBreakdown | null;
  previousBestScore: number;
  ultimateCharges: Record<string, number>;
  activeUltimate: string | null;
  startRun: (opts?: StartRunOptions) => void;
  registerHit: (baseScore: number) => void;
  addScore: (amount: number) => void;
  resetCombo: () => void;
  loseHPBy: (amount: number) => void;
  healHP: (amount: number) => void;
  fullHeal: () => void;
  tickElapsed: (ms: number) => void;
  adjustTimeRemaining: (deltaMs: number) => void;
  setPaused: (paused: boolean) => void;
  setTimePulseIncoming: (incoming: boolean) => void;
  recordBombClick: () => void;
  recordRunResults: (results: RunResults) => void;
  endRun: () => void;
  setUltimateCharges: (charges: Record<string, number>) => void;
  setActiveUltimate: (id: string | null) => void;
  reset: () => void;
}

const freshRun = {
  mode: DEFAULT_MODE,
  score: 0,
  hp: BASE_HP,
  maxHp: BASE_HP,
  combo: 0,
  maxCombo: 0,
  comboCap: DEFAULT_COMBO_CAP,
  elapsedMs: 0,
  timeRemainingMs: 0,
  paused: false,
  timePulseIncoming: false,
  bombClicksThisRun: 0,
  currencyEarned: 0,
  currencyBreakdown: null as CurrencyBreakdown | null,
  previousBestScore: 0,
  ultimateCharges: {} as Record<string, number>,
  activeUltimate: null as string | null,
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
            mode: opts?.mode ?? DEFAULT_MODE,
            hp: maxHp,
            maxHp,
            comboCap: cap,
            timeRemainingMs: opts?.initialTimeMs ?? 0,
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
      addScore: (amount) =>
        set(
          (s) => (amount <= 0 ? s : { score: s.score + amount }),
          false,
          "addScore",
        ),
      resetCombo: () =>
        set((s) => (s.combo === 0 ? s : { combo: 0 }), false, "resetCombo"),
      loseHPBy: (amount) =>
        set(
          (s) => {
            if (s.hp <= 0 || amount <= 0) return s;
            return { hp: clampHP(s.hp - amount, s.maxHp) };
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
      adjustTimeRemaining: (deltaMs) =>
        set(
          (s) => ({
            timeRemainingMs: Math.max(0, s.timeRemainingMs + deltaMs),
          }),
          false,
          "adjustTimeRemaining",
        ),
      setPaused: (paused) =>
        set((s) => (s.paused === paused ? s : { paused }), false, "setPaused"),
      setTimePulseIncoming: (incoming) =>
        set(
          (s) =>
            s.timePulseIncoming === incoming
              ? s
              : { timePulseIncoming: incoming },
          false,
          "setTimePulseIncoming",
        ),
      recordBombClick: () =>
        set(
          (s) => ({ bombClicksThisRun: s.bombClicksThisRun + 1 }),
          false,
          "recordBombClick",
        ),
      recordRunResults: (results) =>
        set(
          {
            currencyEarned: results.currencyEarned,
            currencyBreakdown: results.currencyBreakdown,
            previousBestScore: results.previousBestScore,
          },
          false,
          "recordRunResults",
        ),
      endRun: () =>
        set(
          (s) => (s.status === "gameOver" ? s : { status: "gameOver" }),
          false,
          "endRun",
        ),
      setUltimateCharges: (charges) =>
        set({ ultimateCharges: charges }, false, "setUltimateCharges"),
      setActiveUltimate: (id) =>
        set(
          (s) => (s.activeUltimate === id ? s : { activeUltimate: id }),
          false,
          "setActiveUltimate",
        ),
      reset: () => set({ status: "idle", ...freshRun }, false, "reset"),
    }),
    { name: "runStore" },
  ),
);
