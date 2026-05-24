import { useMetaStore } from "../state/metaStore";
import { useRunStore } from "../state/runStore";
import { useCampaignStore } from "../state/campaignStore";
import { DEFAULT_MODE, type ModeId } from "../data/modes";
import { EffectResolver } from "./effects/EffectResolver";
import { setActiveResolver } from "./effects/activeResolver";
import { createModePolicy } from "./modes/createModePolicy";
import { setActiveModePolicy } from "./modes/activeModePolicy";

export const startNewRun = (mode: ModeId = DEFAULT_MODE): void => {
  const selected = useMetaStore.getState().selectedPerks;
  const resolver = EffectResolver.fromMetaSnapshot(selected);
  const mods = resolver.buildRunModifiers();
  const policy = createModePolicy(mode);
  setActiveResolver(resolver);
  setActiveModePolicy(policy);
  useCampaignStore.getState().reset();
  useRunStore.getState().startRun({
    mode,
    startingHPAdd: mods.startingHPAdd,
    comboCap: mods.comboCap,
    initialTimeMs: policy.initialTimeMs,
  });
};
