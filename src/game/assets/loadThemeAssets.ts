import { Assets } from "pixi.js";
import { THEME_TEXTURES } from "./AssetManifest";

const loaded = new Set<string>();

export const areThemeAssetsLoaded = (themeId: string): boolean =>
  loaded.has(themeId) || (THEME_TEXTURES[themeId] ?? []).length === 0;

export const loadThemeAssets = async (themeId: string): Promise<void> => {
  if (loaded.has(themeId)) return;
  const textures = THEME_TEXTURES[themeId] ?? [];
  if (textures.length > 0) {
    Assets.add(textures.map(({ alias, src }) => ({ alias, src })));
    await Assets.load(textures.map((t) => t.alias));
  }
  loaded.add(themeId);
};
