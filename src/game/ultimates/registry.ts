import type { UltimateImpl } from "./types";

const stub = (
  id: string,
  durationMs: number,
  blocksOthers: boolean,
): UltimateImpl => ({
  id,
  durationMs,
  blocksOthers,
  apply: () => {},
  cleanup: () => {},
});

export const createUltimateRegistry = (): Map<string, UltimateImpl> => {
  const registry = new Map<string, UltimateImpl>();
  registry.set("time-slow", stub("time-slow", 5000, true));
  registry.set("frenzy", stub("frenzy", 8000, true));
  registry.set("restore", stub("restore", 500, false));
  registry.set("chaos-storm", stub("chaos-storm", 4000, true));
  registry.set("bloom", stub("bloom", 5000, true));
  return registry;
};
