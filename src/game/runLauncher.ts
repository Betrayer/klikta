import { useMetaStore } from "../state/metaStore";
import { useRunStore } from "../state/runStore";
import { DEFAULT_MODE } from "../data/modes";
import { EffectResolver } from "./effects/EffectResolver";
import { setActiveResolver } from "./effects/activeResolver";
import { createModePolicy } from "./modes/createModePolicy";
import { setActiveModePolicy } from "./modes/activeModePolicy";

export const startNewRun = (): void => {
  const mode = DEFAULT_MODE;
  const selected = useMetaStore.getState().selectedPerks;
  const resolver = EffectResolver.fromMetaSnapshot(selected);
  const mods = resolver.buildRunModifiers();
  setActiveResolver(resolver);
  setActiveModePolicy(createModePolicy(mode));
  useRunStore.getState().startRun({
    mode,
    startingHPAdd: mods.startingHPAdd,
    comboCap: mods.comboCap,
  });
};
