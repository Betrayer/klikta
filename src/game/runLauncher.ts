import { useMetaStore } from "../state/metaStore";
import { useRunStore } from "../state/runStore";
import { EffectResolver } from "./effects/EffectResolver";
import { setActiveResolver } from "./effects/activeResolver";

export const startNewRun = (): void => {
  const selected = useMetaStore.getState().selectedPerks;
  const resolver = EffectResolver.fromMetaSnapshot(selected);
  const mods = resolver.buildRunModifiers();
  setActiveResolver(resolver);
  useRunStore.getState().startRun({
    startingHPAdd: mods.startingHPAdd,
    comboCap: mods.comboCap,
  });
};
