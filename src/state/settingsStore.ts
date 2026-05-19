import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface SettingsState {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  setMasterVolume: (v: number) => void;
  setSFXVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
}

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set) => ({
      masterVolume: 1,
      sfxVolume: 0.9,
      musicVolume: 0.5,
      setMasterVolume: (v) =>
        set({ masterVolume: clamp01(v) }, false, "setMasterVolume"),
      setSFXVolume: (v) =>
        set({ sfxVolume: clamp01(v) }, false, "setSFXVolume"),
      setMusicVolume: (v) =>
        set({ musicVolume: clamp01(v) }, false, "setMusicVolume"),
    }),
    { name: "settingsStore" },
  ),
);
