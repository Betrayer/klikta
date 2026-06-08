import { useEffect } from "react";
import { useMetaStore } from "../state/metaStore";
import { getCursorSpec } from "../state/themeSelectors";
import {
  CURSOR_TEXTURES,
  resolveCursorValue,
} from "../data/themes/cursorTextures";

export const useThemeCursor = (): void => {
  const themeId = useMetaStore((s) => s.activeThemeId);
  useEffect(() => {
    const value = resolveCursorValue(getCursorSpec()?.default, CURSOR_TEXTURES);
    document.body.style.cursor = value ?? "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [themeId]);
};
