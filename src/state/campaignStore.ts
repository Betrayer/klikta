import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface RunPerkChoice {
  id: string;
  name: string;
  description: string;
}

export interface CampaignState {
  active: boolean;
  currentWave: number;
  totalWaves: number;
  breakActive: boolean;
  upcomingWave: number;
  choices: RunPerkChoice[];
  begin: (totalWaves: number) => void;
  setWave: (wave: number) => void;
  openBreak: (upcomingWave: number, choices: RunPerkChoice[]) => void;
  closeBreak: () => void;
  reset: () => void;
}

const fresh = {
  active: false,
  currentWave: 1,
  totalWaves: 0,
  breakActive: false,
  upcomingWave: 1,
  choices: [] as RunPerkChoice[],
};

export const useCampaignStore = create<CampaignState>()(
  devtools(
    (set) => ({
      ...fresh,
      begin: (totalWaves) =>
        set(
          { ...fresh, active: true, totalWaves, currentWave: 1 },
          false,
          "begin",
        ),
      setWave: (wave) =>
        set(
          (s) => (s.currentWave === wave ? s : { currentWave: wave }),
          false,
          "setWave",
        ),
      openBreak: (upcomingWave, choices) =>
        set({ breakActive: true, upcomingWave, choices }, false, "openBreak"),
      closeBreak: () =>
        set({ breakActive: false, choices: [] }, false, "closeBreak"),
      reset: () => set({ ...fresh }, false, "reset"),
    }),
    { name: "campaignStore" },
  ),
);
