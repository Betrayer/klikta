import { useMetaStore } from "../../../state/metaStore";
import { DEFAULT_THEME, THEMES } from "../../../data/themes";
import type { HudSpec } from "../../../data/themes/types";

export const useHudSpec = (): HudSpec => {
  const themeId = useMetaStore((s) => s.activeThemeId);
  return (THEMES[themeId] ?? DEFAULT_THEME).hud;
};
