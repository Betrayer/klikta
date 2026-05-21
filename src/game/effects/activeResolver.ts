import { EffectResolver } from "./EffectResolver";

let active: EffectResolver = EffectResolver.empty();

export const setActiveResolver = (resolver: EffectResolver): void => {
  active = resolver;
};

export const getActiveResolver = (): EffectResolver => active;
