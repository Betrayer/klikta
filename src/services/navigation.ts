import { useRunStore } from "../state/runStore";
import { useAppStore } from "../state/appStore";

export const navigateBack = (): boolean => {
  const run = useRunStore.getState();
  const app = useAppStore.getState();

  if (run.status === "playing") {
    run.setPaused(!run.paused);
    return true;
  }
  if (run.status === "gameOver") {
    run.reset();
    app.setScreen("menu");
    return true;
  }
  if (app.customizeOpen) {
    app.setCustomizeOpen(false);
    return true;
  }
  if (app.screen !== "menu") {
    app.setScreen("menu");
    return true;
  }
  return false;
};
