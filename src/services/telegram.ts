import {
  backButton,
  closingBehavior,
  hapticFeedback,
  init,
  isTMA,
  miniApp,
  retrieveLaunchParams,
  themeParams,
  viewport,
} from "@tma.js/sdk";
import { useSettingsStore } from "../state/settingsStore";

const THEME_COLOR = "#1a0033";

const TELEGRAM_USER_ALLOWLIST: readonly number[] = [];

export interface TelegramSession {
  isTelegram: boolean;
  platform: string | null;
  version: string | null;
  startParam: string | null;
  userId: number | null;
  firstName: string | null;
  username: string | null;
}

const browserSession: TelegramSession = {
  isTelegram: false,
  platform: null,
  version: null,
  startParam: null,
  userId: null,
  firstName: null,
  username: null,
};

let session: TelegramSession = browserSession;

export const getTelegramSession = (): TelegramSession => session;

export const isTelegramEnvironment = (): boolean =>
  session.isTelegram || isTMA();

export const isTelegramAccessAllowed = (): boolean => {
  if (!session.isTelegram) return true;
  if (TELEGRAM_USER_ALLOWLIST.length === 0) return true;
  return (
    session.userId !== null && TELEGRAM_USER_ALLOWLIST.includes(session.userId)
  );
};

const readLaunchParams = (): TelegramSession => {
  try {
    const launchParams = retrieveLaunchParams();
    const user = launchParams.tgWebAppData?.user ?? null;
    return {
      isTelegram: true,
      platform: launchParams.tgWebAppPlatform,
      version: launchParams.tgWebAppVersion,
      startParam: launchParams.tgWebAppStartParam ?? null,
      userId: user?.id ?? null,
      firstName: user?.first_name ?? null,
      username: user?.username ?? null,
    };
  } catch {
    return {
      isTelegram: true,
      platform: null,
      version: null,
      startParam: null,
      userId: null,
      firstName: null,
      username: null,
    };
  }
};

const setupViewport = async (): Promise<void> => {
  const mount = viewport.mount.ifAvailable();
  if (!mount.ok) return;
  try {
    await mount.data;
  } catch {
    return;
  }
  viewport.expand.ifAvailable();
  viewport.bindCssVars.ifAvailable();
};

const setupMiniApp = (): void => {
  miniApp.mount.ifAvailable();
  miniApp.bindCssVars.ifAvailable();
  miniApp.setBgColor.ifAvailable(THEME_COLOR);
  miniApp.ready.ifAvailable();
  backButton.mount.ifAvailable();
  closingBehavior.mount.ifAvailable();
  themeParams.mount.ifAvailable();
};

export const getTelegramAccentColor = (): string | undefined => {
  if (!session.isTelegram) return undefined;
  try {
    return themeParams.buttonColor() ?? undefined;
  } catch {
    return undefined;
  }
};

export type GameHapticEvent =
  | "hit"
  | "golden"
  | "bomb"
  | "milestone"
  | "ultimate"
  | "gameOver";

export const haptic = (event: GameHapticEvent): void => {
  if (!session.isTelegram) return;
  if (!useSettingsStore.getState().hapticsEnabled) return;
  switch (event) {
    case "hit":
      hapticFeedback.impactOccurred.ifAvailable("light");
      return;
    case "golden":
      hapticFeedback.impactOccurred.ifAvailable("medium");
      return;
    case "milestone":
      hapticFeedback.impactOccurred.ifAvailable("medium");
      return;
    case "bomb":
      hapticFeedback.impactOccurred.ifAvailable("heavy");
      hapticFeedback.notificationOccurred.ifAvailable("error");
      return;
    case "ultimate":
      hapticFeedback.notificationOccurred.ifAvailable("success");
      return;
    case "gameOver":
      hapticFeedback.notificationOccurred.ifAvailable("warning");
      return;
  }
};

export const showBackButton = (): void => {
  backButton.show.ifAvailable();
};

export const hideBackButton = (): void => {
  backButton.hide.ifAvailable();
};

export const onBackButton = (handler: () => void): (() => void) => {
  const result = backButton.onClick.ifAvailable(handler);
  return result.ok ? result.data : () => {};
};

export const enableRunCloseGuard = (): void => {
  closingBehavior.enableConfirmation.ifAvailable();
};

export const disableRunCloseGuard = (): void => {
  closingBehavior.disableConfirmation.ifAvailable();
};

export const isFullscreenSupported = (): boolean =>
  viewport.requestFullscreen.isAvailable();

export const isFullscreenActive = (): boolean => {
  try {
    return viewport.isFullscreen();
  } catch {
    return false;
  }
};

export const enterFullscreen = (): void => {
  viewport.requestFullscreen.ifAvailable();
};

export const exitFullscreen = (): void => {
  viewport.exitFullscreen.ifAvailable();
};

export const initTelegram = async (): Promise<TelegramSession> => {
  if (!isTMA()) return browserSession;
  try {
    init();
  } catch {
    return browserSession;
  }
  session = readLaunchParams();
  await setupViewport();
  setupMiniApp();
  return session;
};
