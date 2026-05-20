let handler: ((id: string) => void) | null = null;

export const setUltimateActivationHandler = (
  next: ((id: string) => void) | null,
): void => {
  handler = next;
};

export const requestUltimateActivation = (id: string): void => {
  handler?.(id);
};
