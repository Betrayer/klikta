import { useEffect } from "react";
import { useRunStore } from "../state/runStore";
import { useAppStore } from "../state/appStore";
import {
  disableRunCloseGuard,
  enableRunCloseGuard,
  hideBackButton,
  onBackButton,
  showBackButton,
} from "../services/telegram";
import { navigateBack } from "../services/navigation";

export const useTelegramRuntime = (): void => {
  const status = useRunStore((s) => s.status);
  const screen = useAppStore((s) => s.screen);
  const customizeOpen = useAppStore((s) => s.customizeOpen);

  useEffect(() => onBackButton(navigateBack), []);

  useEffect(() => {
    if (status === "playing") enableRunCloseGuard();
    else disableRunCloseGuard();
  }, [status]);

  useEffect(() => {
    const canGoBack =
      status === "playing" ||
      status === "gameOver" ||
      customizeOpen ||
      screen !== "menu";
    if (canGoBack) showBackButton();
    else hideBackButton();
  }, [status, screen, customizeOpen]);
};
