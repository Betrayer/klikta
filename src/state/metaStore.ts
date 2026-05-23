import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { ModeId } from "../data/modes";

export interface MetaState {
  currency: number;
  totalEarnedCurrency: number;
  selectedPerks: Record<string, string>;
  unlockedUltimates: string[];

  runsCompleted: number;
  totalRunScore: number;
  bestScores: Partial<Record<ModeId, number>>;
  achievements: string[];

  awardCurrency: (amount: number) => void;
  spendCurrency: (amount: number) => boolean;
  selectPerk: (tierKey: string, perkId: string) => void;
  unselectPerk: (tierKey: string) => void;
  unlockUltimate: (id: string) => void;
  recordRun: (mode: ModeId, score: number) => void;
  unlockAchievement: (id: string) => boolean;
  resetAllProgress: () => void;
}

export const META_VERSION = 2;

export const migrateMeta = (persisted: unknown, version: number): MetaState => {
  const data: Record<string, unknown> = {
    ...(persisted as Record<string, unknown> | null),
  };
  if (version < META_VERSION) {
    const legacyBest = typeof data.bestScore === "number" ? data.bestScore : 0;
    delete data.bestScore;
    data.bestScores = legacyBest > 0 ? { endless_hp: legacyBest } : {};
  }
  return data as unknown as MetaState;
};

const initialMeta = {
  currency: 0,
  totalEarnedCurrency: 0,
  selectedPerks: {} as Record<string, string>,
  unlockedUltimates: [] as string[],
  runsCompleted: 0,
  totalRunScore: 0,
  bestScores: {} as Partial<Record<ModeId, number>>,
  achievements: [] as string[],
};

export const useMetaStore = create<MetaState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialMeta,

        awardCurrency: (amount) =>
          set(
            (s) => ({
              currency: s.currency + amount,
              totalEarnedCurrency: s.totalEarnedCurrency + amount,
            }),
            false,
            "awardCurrency",
          ),

        spendCurrency: (amount) => {
          const state = get();
          if (state.currency < amount) return false;
          set({ currency: state.currency - amount }, false, "spendCurrency");
          return true;
        },

        selectPerk: (tierKey, perkId) =>
          set(
            (s) => ({
              selectedPerks: { ...s.selectedPerks, [tierKey]: perkId },
            }),
            false,
            "selectPerk",
          ),

        unselectPerk: (tierKey) =>
          set(
            (s) => {
              if (s.selectedPerks[tierKey] === undefined) return s;
              const next = { ...s.selectedPerks };
              delete next[tierKey];
              return { selectedPerks: next };
            },
            false,
            "unselectPerk",
          ),

        unlockUltimate: (id) =>
          set(
            (s) =>
              s.unlockedUltimates.includes(id)
                ? s
                : { unlockedUltimates: [...s.unlockedUltimates, id] },
            false,
            "unlockUltimate",
          ),

        recordRun: (mode, score) =>
          set(
            (s) => ({
              runsCompleted: s.runsCompleted + 1,
              totalRunScore: s.totalRunScore + score,
              bestScores: {
                ...s.bestScores,
                [mode]: Math.max(s.bestScores[mode] ?? 0, score),
              },
            }),
            false,
            "recordRun",
          ),

        unlockAchievement: (id) => {
          const state = get();
          if (state.achievements.includes(id)) return false;
          set(
            { achievements: [...state.achievements, id] },
            false,
            "unlockAchievement",
          );
          return true;
        },

        resetAllProgress: () =>
          set({ ...initialMeta }, false, "resetAllProgress"),
      }),
      {
        name: "klikta-meta-v1",
        version: META_VERSION,
        migrate: migrateMeta,
        partialize: (state) => ({
          currency: state.currency,
          totalEarnedCurrency: state.totalEarnedCurrency,
          selectedPerks: state.selectedPerks,
          unlockedUltimates: state.unlockedUltimates,
          runsCompleted: state.runsCompleted,
          totalRunScore: state.totalRunScore,
          bestScores: state.bestScores,
          achievements: state.achievements,
        }),
      },
    ),
    { name: "metaStore" },
  ),
);
