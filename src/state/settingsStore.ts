import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import i18n, { applyLanguageBundles } from "../i18n";
import {
  DEFAULT_LANGUAGE,
  isSupportedLang,
  type SupportedLang,
} from "../i18n/languages";

export interface SettingsState {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  hapticsEnabled: boolean;
  useTelegramTheme: boolean;
  reduceMotion: boolean;
  language: SupportedLang;
  setMasterVolume: (v: number) => void;
  setSFXVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  setHapticsEnabled: (v: boolean) => void;
  setUseTelegramTheme: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setLanguage: (lang: SupportedLang) => void;
  reset: () => void;
}

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

const initialSettings = {
  masterVolume: 1,
  sfxVolume: 0.9,
  musicVolume: 0.5,
  hapticsEnabled: true,
  useTelegramTheme: false,
  reduceMotion: false,
  language: DEFAULT_LANGUAGE,
};

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        ...initialSettings,
        setMasterVolume: (v) =>
          set({ masterVolume: clamp01(v) }, false, "setMasterVolume"),
        setSFXVolume: (v) =>
          set({ sfxVolume: clamp01(v) }, false, "setSFXVolume"),
        setMusicVolume: (v) =>
          set({ musicVolume: clamp01(v) }, false, "setMusicVolume"),
        setHapticsEnabled: (v) =>
          set({ hapticsEnabled: v }, false, "setHapticsEnabled"),
        setUseTelegramTheme: (v) =>
          set({ useTelegramTheme: v }, false, "setUseTelegramTheme"),
        setReduceMotion: (v) =>
          set({ reduceMotion: v }, false, "setReduceMotion"),
        setLanguage: (lang) => {
          set({ language: lang }, false, "setLanguage");
          void i18n.changeLanguage(lang).then(() => applyLanguageBundles(lang));
        },
        reset: () => set({ ...initialSettings }, false, "reset"),
      }),
      {
        name: "klikta-settings-v1",
        version: 3,
        migrate: (persistedState) => {
          const s = (persistedState ?? {}) as Partial<SettingsState>;
          return {
            ...s,
            hapticsEnabled: s.hapticsEnabled ?? true,
            useTelegramTheme: s.useTelegramTheme ?? false,
            reduceMotion: s.reduceMotion ?? false,
            language: isSupportedLang(s.language)
              ? s.language
              : DEFAULT_LANGUAGE,
          } as SettingsState;
        },
        partialize: (state) => ({
          masterVolume: state.masterVolume,
          sfxVolume: state.sfxVolume,
          musicVolume: state.musicVolume,
          hapticsEnabled: state.hapticsEnabled,
          useTelegramTheme: state.useTelegramTheme,
          reduceMotion: state.reduceMotion,
          language: state.language,
        }),
      },
    ),
    { name: "settingsStore" },
  ),
);
