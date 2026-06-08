import { useEffect } from "react";
import { useMetaStore } from "../state/metaStore";
import { getActiveTheme } from "../state/themeSelectors";
import { backgroundCss } from "./components/themePreviewStyle";

export const useThemeBackground = (): void => {
  const themeId = useMetaStore((s) => s.activeThemeId);
  useEffect(() => {
    const css = backgroundCss(getActiveTheme().background);
    document.documentElement.style.background = css;
    document.body.style.background = css;
    return () => {
      document.documentElement.style.background = "";
      document.body.style.background = "";
    };
  }, [themeId]);
};
