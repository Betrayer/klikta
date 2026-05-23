type UltimateActivationHandler = (id: string) => void;

let handler: UltimateActivationHandler | null = null;

export const setUltimateActivationHandler = (
  next: UltimateActivationHandler,
): void => {
  handler = next;
};

export const clearUltimateActivationHandler = (
  h: UltimateActivationHandler,
): void => {
  if (handler === h) handler = null;
};

export const requestUltimateActivation = (id: string): void => {
  handler?.(id);
};
