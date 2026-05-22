const WEB_GATE_PASSWORD = "hubbabubba";
const UNLOCK_KEY = "klikta-web-unlocked";

export const isWebGateEnabled = (): boolean => WEB_GATE_PASSWORD.length > 0;

export const isWebUnlocked = (): boolean => {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
};

export const tryUnlockWeb = (password: string): boolean => {
  if (password !== WEB_GATE_PASSWORD) return false;
  try {
    sessionStorage.setItem(UNLOCK_KEY, "1");
    return true;
  } catch {
    return true;
  }
};
