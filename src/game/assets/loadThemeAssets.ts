import { Assets } from "pixi.js";
import { THEME_TEXTURES } from "./AssetManifest";

const loaded = new Set<string>();
const inFlight = new Map<string, Promise<void>>();

export const areThemeAssetsLoaded = (themeId: string): boolean =>
  loaded.has(themeId) || (THEME_TEXTURES[themeId] ?? []).length === 0;

export const loadThemeAssets = async (themeId: string): Promise<void> => {
  if (loaded.has(themeId)) return;
  const pending = inFlight.get(themeId);
  if (pending !== undefined) return pending;

  const textures = THEME_TEXTURES[themeId] ?? [];
  const task = (async (): Promise<void> => {
    try {
      if (textures.length > 0) {
        Assets.add(textures.map(({ alias, src }) => ({ alias, src })));
        await Assets.load(textures.map((t) => t.alias));
      }
      loaded.add(themeId);
    } finally {
      inFlight.delete(themeId);
    }
  })();
  inFlight.set(themeId, task);
  return task;
};
