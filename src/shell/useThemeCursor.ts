import { useEffect } from "react";
import { useMetaStore } from "../state/metaStore";
import { getCursorSpec } from "../state/themeSelectors";
import { CURSOR_TEXTURES } from "./cursorTextures";

export const resolveCursorValue = (
  key: string | undefined,
  registry: Record<string, string>,
): string | undefined => {
  if (key === undefined) return undefined;
  const url = registry[key];
  return url !== undefined ? `url(${url}), auto` : undefined;
};

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
