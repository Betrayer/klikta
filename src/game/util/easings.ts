export type EasingFn = (t: number) => number;

export const linear: EasingFn = (t) => t;

export const easeOutCubic: EasingFn = (t) => 1 - Math.pow(1 - t, 3);

export const easeInOutQuad: EasingFn = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export const easeOutBack: EasingFn = (t) => {
  const overshoot = 1.70158;
  const scaled = overshoot + 1;
  return 1 + scaled * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
};
