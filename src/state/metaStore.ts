import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { ModeId } from "../data/modes";
import { DEFAULT_THEME, DEFAULT_THEME_ID, THEMES } from "../data/themes";
import { DEFAULT_SOUND_PACK_ID } from "../data/sound";
import type { HudStyle } from "../data/themes/types";

export interface MetaSnapshot {
  currency: number;
  totalEarnedCurrency: number;
  selectedPerks: Record<string, string>;
  unlockedUltimates: string[];
  runsCompleted: number;
  totalRunScore: number;
  bestScores: Partial<Record<ModeId, number>>;
  achievements: string[];
  activeThemeId: string;
  activeMusicPackId: string;
  activeSfxPackId: string;
  activeHudStyle: HudStyle;
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
  activeThemeId: string;
  activeMusicPackId: string;
  activeSfxPackId: string;
  activeHudStyle: HudStyle;
  updatedAt: number;

  awardCurrency: (amount: number) => void;
  spendCurrency: (amount: number) => boolean;
  selectPerk: (tierKey: string, perkId: string) => void;
  unselectPerk: (tierKey: string) => void;
  clearPerks: () => void;
  unlockUltimate: (id: string) => void;
  recordRun: (mode: ModeId, score: number) => void;
  unlockAchievement: (id: string) => boolean;
  setActiveTheme: (id: string) => void;
  setActiveMusicPack: (id: string) => void;
  setActiveSfxPack: (id: string) => void;
  setActiveHudStyle: (value: HudStyle) => void;
  resetAllProgress: () => void;
  hydrateFromCloud: (snapshot: MetaSnapshot) => void;
}

const META_VERSION = 5;

export const migrateMeta = (persisted: unknown, version: number): MetaState => {
  const data: Record<string, unknown> = {
    ...(persisted as Record<string, unknown> | null),
  };
  if (version < 2) {
    const legacyBest = typeof data.bestScore === "number" ? data.bestScore : 0;
    delete data.bestScore;
    data.bestScores = legacyBest > 0 ? { endless_hp: legacyBest } : {};
    data.updatedAt = Date.now();
  }
  if (version < 3) {
    if (typeof data.activeThemeId !== "string") {
      data.activeThemeId = DEFAULT_THEME_ID;
    }
    if (typeof data.activeMusicPackId !== "string") {
      data.activeMusicPackId = DEFAULT_SOUND_PACK_ID;
    }
    if (typeof data.activeSfxPackId !== "string") {
      data.activeSfxPackId = DEFAULT_SOUND_PACK_ID;
    }
  }
  if (version < 5) {
    const prev = data.hudStyleOverride;
    data.activeHudStyle =
      prev === "framed" || prev === "minimal" || prev === "ringed"
        ? prev
        : DEFAULT_THEME.hud.style;
    delete data.hudStyleOverride;
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
  activeThemeId: DEFAULT_THEME_ID,
  activeMusicPackId: DEFAULT_SOUND_PACK_ID,
  activeSfxPackId: DEFAULT_SOUND_PACK_ID,
  activeHudStyle: DEFAULT_THEME.hud.style,
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
  activeThemeId: state.activeThemeId,
  activeMusicPackId: state.activeMusicPackId,
  activeSfxPackId: state.activeSfxPackId,
  activeHudStyle: state.activeHudStyle,
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

        clearPerks: () =>
          set(
            (s) =>
              Object.keys(s.selectedPerks).length === 0
                ? s
                : { selectedPerks: {}, updatedAt: Date.now() },
            false,
            "clearPerks",
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
            {
              achievements: [...state.achievements, id],
              updatedAt: Date.now(),
            },
            false,
            "unlockAchievement",
          );
          return true;
        },

        setActiveTheme: (id) =>
          set(
            {
              activeThemeId: id,
              activeHudStyle: (THEMES[id] ?? DEFAULT_THEME).hud.style,
              updatedAt: Date.now(),
            },
            false,
            "setActiveTheme",
          ),

        setActiveMusicPack: (id) =>
          set(
            { activeMusicPackId: id, updatedAt: Date.now() },
            false,
            "setActiveMusicPack",
          ),

        setActiveSfxPack: (id) =>
          set(
            { activeSfxPackId: id, updatedAt: Date.now() },
            false,
            "setActiveSfxPack",
          ),

        setActiveHudStyle: (value) =>
          set(
            { activeHudStyle: value, updatedAt: Date.now() },
            false,
            "setActiveHudStyle",
          ),

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
              activeThemeId: snapshot.activeThemeId,
              activeMusicPackId: snapshot.activeMusicPackId,
              activeSfxPackId: snapshot.activeSfxPackId,
              activeHudStyle: snapshot.activeHudStyle,
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
          activeThemeId: state.activeThemeId,
          activeMusicPackId: state.activeMusicPackId,
          activeSfxPackId: state.activeSfxPackId,
          activeHudStyle: state.activeHudStyle,
          updatedAt: state.updatedAt,
        }),
      },
    ),
    { name: "metaStore" },
  ),
);
