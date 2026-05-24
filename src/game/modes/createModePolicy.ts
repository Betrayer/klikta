import type { ModeId } from "../../data/modes";
import type { ModePolicy } from "./ModePolicy";
import { EndlessHPMode } from "./EndlessHPMode";
import { EndlessTimerMode } from "./EndlessTimerMode";
import { CampaignMode } from "./CampaignMode";
import { PhysicsChaosMode } from "./PhysicsChaosMode";

export const createModePolicy = (mode: ModeId): ModePolicy => {
  switch (mode) {
    case "endless_hp":
      return new EndlessHPMode();
    case "endless_timer":
      return new EndlessTimerMode();
    case "campaign":
      return new CampaignMode();
    case "physics_chaos":
      return new PhysicsChaosMode();
  }
};
