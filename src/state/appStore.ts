import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type Screen =
  | "menu"
  | "mode-select"
  | "skill-tree"
  | "leaderboard"
  | "settings";

export interface AppState {
  screen: Screen;
  customizeOpen: boolean;
  setScreen: (screen: Screen) => void;
  setCustomizeOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      screen: "menu",
      customizeOpen: false,
      setScreen: (screen) => set({ screen }, false, "setScreen"),
      setCustomizeOpen: (customizeOpen) =>
        set({ customizeOpen }, false, "setCustomizeOpen"),
    }),
    { name: "appStore" },
  ),
);
