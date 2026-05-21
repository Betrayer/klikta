import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface SettingsState {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  setMasterVolume: (v: number) => void;
  setSFXVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  reset: () => void;
}

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

const initialSettings = {
  masterVolume: 1,
  sfxVolume: 0.9,
  musicVolume: 0.5,
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
        reset: () => set({ ...initialSettings }, false, "reset"),
      }),
      {
        name: "klikta-settings-v1",
        version: 1,
        migrate: (persistedState) => persistedState as SettingsState,
        partialize: (state) => ({
          masterVolume: state.masterVolume,
          sfxVolume: state.sfxVolume,
          musicVolume: state.musicVolume,
        }),
      },
    ),
    { name: "settingsStore" },
  ),
);
