import type { UltimateImpl } from "./types";
import { createTimeSlow } from "./TimeSlow";
import { createFrenzy } from "./Frenzy";
import { createRestore } from "./Restore";
import { createChaosStorm } from "./ChaosStorm";
import { createBloom } from "./Bloom";

export const createUltimateRegistry = (): Map<string, UltimateImpl> => {
  const registry = new Map<string, UltimateImpl>();
  const impls = [
    createTimeSlow(),
    createFrenzy(),
    createRestore(),
    createChaosStorm(),
    createBloom(),
  ];
  for (const impl of impls) registry.set(impl.id, impl);
  return registry;
};
