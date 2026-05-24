import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { ModeId } from "../data/modes";

export interface MetaSnapshot {
  currency: number;
  totalEarnedCurrency: number;
  selectedPerks: Record<string, string>;
  unlockedUltimates: string[];
  runsCompleted: number;
  totalRunScore: number;
  bestScores: Partial<Record<ModeId, number>>;
  achievements: string[];
  updatedAt: number;
}

export interface MetaState {
  currency: number;
  totalEarnedCurrency: number;
  selectedPerks: Record<string, string>;
  unlockedUltimates: string[];

  runsCompleted: number;
  totalRunScore: number;
  bestScores: Partial<Record<ModeId, number>>;
  achievements: string[];
  updatedAt: number;

  awardCurrency: (amount: number) => void;
  spendCurrency: (amount: number) => boolean;
  selectPerk: (tierKey: string, perkId: string) => void;
  unselectPerk: (tierKey: string) => void;
  unlockUltimate: (id: string) => void;
  recordRun: (mode: ModeId, score: number) => void;
  unlockAchievement: (id: string) => boolean;
  resetAllProgress: () => void;
  hydrateFromCloud: (snapshot: MetaSnapshot) => void;
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
    data.updatedAt = Date.now();
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
  updatedAt: 0,
};

export const selectMetaSnapshot = (state: MetaState): MetaSnapshot => ({
  currency: state.currency,
  totalEarnedCurrency: state.totalEarnedCurrency,
  selectedPerks: state.selectedPerks,
  unlockedUltimates: state.unlockedUltimates,
  runsCompleted: state.runsCompleted,
  totalRunScore: state.totalRunScore,
  bestScores: state.bestScores,
  achievements: state.achievements,
  updatedAt: state.updatedAt,
});

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
              updatedAt: Date.now(),
            }),
            false,
            "awardCurrency",
          ),

        spendCurrency: (amount) => {
          const state = get();
          if (state.currency < amount) return false;
          set(
            { currency: state.currency - amount, updatedAt: Date.now() },
            false,
            "spendCurrency",
          );
          return true;
        },

        selectPerk: (tierKey, perkId) =>
          set(
            (s) => ({
              selectedPerks: { ...s.selectedPerks, [tierKey]: perkId },
              updatedAt: Date.now(),
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
              return { selectedPerks: next, updatedAt: Date.now() };
            },
            false,
            "unselectPerk",
          ),

        unlockUltimate: (id) =>
          set(
            (s) =>
              s.unlockedUltimates.includes(id)
                ? s
                : {
                    unlockedUltimates: [...s.unlockedUltimates, id],
                    updatedAt: Date.now(),
                  },
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
              updatedAt: Date.now(),
            }),
            false,
            "recordRun",
          ),

        unlockAchievement: (id) => {
          const state = get();
          if (state.achievements.includes(id)) return false;
          set(
            { achievements: [...state.achievements, id], updatedAt: Date.now() },
            false,
            "unlockAchievement",
          );
          return true;
        },

        resetAllProgress: () =>
          set(
            { ...initialMeta, updatedAt: Date.now() },
            false,
            "resetAllProgress",
          ),

        hydrateFromCloud: (snapshot) =>
          set(
            {
              currency: snapshot.currency,
              totalEarnedCurrency: snapshot.totalEarnedCurrency,
              selectedPerks: snapshot.selectedPerks,
              unlockedUltimates: snapshot.unlockedUltimates,
              runsCompleted: snapshot.runsCompleted,
              totalRunScore: snapshot.totalRunScore,
              bestScores: snapshot.bestScores,
              achievements: snapshot.achievements,
              updatedAt: snapshot.updatedAt,
            },
            false,
            "hydrateFromCloud",
          ),
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
          updatedAt: state.updatedAt,
        }),
      },
    ),
    { name: "metaStore" },
  ),
);
