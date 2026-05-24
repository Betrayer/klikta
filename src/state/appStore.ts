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
  setScreen: (screen: Screen) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      screen: "menu",
      setScreen: (screen) => set({ screen }, false, "setScreen"),
    }),
    { name: "appStore" },
  ),
);
