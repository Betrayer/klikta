import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface MetaState {
  currency: number;
  totalEarnedCurrency: number;
  selectedPerks: Record<string, string>;
  unlockedUltimates: string[];
  activeUltimate: string | null;

  runsCompleted: number;
  totalRunScore: number;
  bestScore: number;
  achievements: string[];

  awardCurrency: (amount: number) => void;
  spendCurrency: (amount: number) => boolean;
  selectPerk: (tierKey: string, perkId: string) => void;
  unselectPerk: (tierKey: string) => void;
  unlockUltimate: (id: string) => void;
  setActiveUltimate: (id: string | null) => void;
  recordRun: (score: number) => void;
  unlockAchievement: (id: string) => boolean;
  resetAllProgress: () => void;
}

const initialMeta = {
  currency: 0,
  totalEarnedCurrency: 0,
  selectedPerks: {} as Record<string, string>,
  unlockedUltimates: [] as string[],
  activeUltimate: null as string | null,
  runsCompleted: 0,
  totalRunScore: 0,
  bestScore: 0,
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

        setActiveUltimate: (id) =>
          set({ activeUltimate: id }, false, "setActiveUltimate"),

        recordRun: (score) =>
          set(
            (s) => ({
              runsCompleted: s.runsCompleted + 1,
              totalRunScore: s.totalRunScore + score,
              bestScore: Math.max(s.bestScore, score),
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
        version: 1,
        migrate: (persistedState) => persistedState as MetaState,
        partialize: (state) => ({
          currency: state.currency,
          totalEarnedCurrency: state.totalEarnedCurrency,
          selectedPerks: state.selectedPerks,
          unlockedUltimates: state.unlockedUltimates,
          activeUltimate: state.activeUltimate,
          runsCompleted: state.runsCompleted,
          totalRunScore: state.totalRunScore,
          bestScore: state.bestScore,
          achievements: state.achievements,
        }),
      },
    ),
    { name: "metaStore" },
  ),
);
