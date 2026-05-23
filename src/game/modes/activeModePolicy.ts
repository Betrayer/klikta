import { EndlessHPMode } from "./EndlessHPMode";
import type { ModePolicy } from "./ModePolicy";

let active: ModePolicy = new EndlessHPMode();

export const setActiveModePolicy = (policy: ModePolicy): void => {
  active = policy;
};

export const getActiveModePolicy = (): ModePolicy => active;
