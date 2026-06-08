const COARSE_POINTER_QUERY = "(pointer: coarse)";

let touchCapable: boolean | null = null;

export const isTouchDevice = (): boolean => {
  if (touchCapable === null) {
    touchCapable =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia(COARSE_POINTER_QUERY).matches;
  }
  return touchCapable;
};

export const TOUCH_RADIUS_MUL = 1.25;

export const touchRadiusMul = (): number =>
  isTouchDevice() ? TOUCH_RADIUS_MUL : 1;
