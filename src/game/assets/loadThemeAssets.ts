import { Assets } from "pixi.js";
import { THEME_TEXTURES } from "./AssetManifest";

const registered = new Set<string>();
const inFlight = new Map<string, Promise<void>>();

export const areThemeAssetsLoaded = (themeId: string): boolean =>
  (THEME_TEXTURES[themeId] ?? []).every((t) => Assets.cache.has(t.alias));

export const loadThemeAssets = async (themeId: string): Promise<void> => {
  if (areThemeAssetsLoaded(themeId)) return;
  const pending = inFlight.get(themeId);
  if (pending !== undefined) return pending;

  const textures = THEME_TEXTURES[themeId] ?? [];
  const task = (async (): Promise<void> => {
    try {
      const fresh = textures.filter((t) => !registered.has(t.alias));
      if (fresh.length > 0) {
        Assets.add(fresh.map(({ alias, src }) => ({ alias, src })));
        for (const t of fresh) registered.add(t.alias);
      }
      if (textures.length > 0) {
        await Assets.load(textures.map((t) => t.alias));
      }
    } finally {
      inFlight.delete(themeId);
    }
  })();
  inFlight.set(themeId, task);
  return task;
};
