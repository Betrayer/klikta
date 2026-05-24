import { useAuthStore, type AuthState } from "../state/authStore";
import { selectMetaSnapshot, useMetaStore } from "../state/metaStore";
import { loadCloudSave, writeCloudSave } from "./cloudSave";

const PUSH_DEBOUNCE_MS = 2500;

let activeUid: string | null = null;
let lastPushedAt = 0;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let applyingCloud = false;

const cancelPush = (): void => {
  if (pushTimer === null) return;
  clearTimeout(pushTimer);
  pushTimer = null;
};

const reconcile = async (uid: string): Promise<void> => {
  applyingCloud = true;
  try {
    const cloud = await loadCloudSave(uid);
    const local = selectMetaSnapshot(useMetaStore.getState());
    if (cloud === null) {
      await writeCloudSave(uid, local);
      lastPushedAt = local.updatedAt;
      return;
    }
    if (cloud.updatedAt > local.updatedAt) {
      useMetaStore.getState().hydrateFromCloud(cloud);
      lastPushedAt = cloud.updatedAt;
    } else if (local.updatedAt > cloud.updatedAt) {
      await writeCloudSave(uid, local);
      lastPushedAt = local.updatedAt;
    } else {
      lastPushedAt = cloud.updatedAt;
    }
  } catch (error) {
    console.warn("cloud sync reconcile failed", error);
  } finally {
    applyingCloud = false;
  }
};

const flushPush = async (): Promise<void> => {
  const uid = activeUid;
  if (uid === null) return;
  const local = selectMetaSnapshot(useMetaStore.getState());
  if (local.updatedAt <= lastPushedAt) return;
  try {
    await writeCloudSave(uid, local);
    lastPushedAt = local.updatedAt;
  } catch (error) {
    console.warn("cloud sync push failed", error);
  }
};

const schedulePush = (): void => {
  if (activeUid === null || applyingCloud) return;
  cancelPush();
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void flushPush();
  }, PUSH_DEBOUNCE_MS);
};

const handleAuth = (state: AuthState): void => {
  const account = state.account;
  const synced =
    state.status === "signed-in" && account !== null && !account.isAnonymous;
  if (synced && account) {
    if (activeUid === account.uid) return;
    activeUid = account.uid;
    lastPushedAt = 0;
    void reconcile(account.uid);
    return;
  }
  activeUid = null;
  lastPushedAt = 0;
  cancelPush();
};

export const startCloudSync = (): void => {
  handleAuth(useAuthStore.getState());
  useAuthStore.subscribe(handleAuth);
  useMetaStore.subscribe(schedulePush);
};
