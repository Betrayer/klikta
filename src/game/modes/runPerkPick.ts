type RunPerkPickHandler = (perkId: string) => void;

let handler: RunPerkPickHandler | null = null;

export const setRunPerkPickHandler = (h: RunPerkPickHandler): void => {
  handler = h;
};

export const clearRunPerkPickHandler = (h: RunPerkPickHandler): void => {
  if (handler === h) handler = null;
};

export const requestRunPerkPick = (perkId: string): void => {
  handler?.(perkId);
};
