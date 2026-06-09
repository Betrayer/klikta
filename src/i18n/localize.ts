import i18n from "./index";

export type DataNamespace = "perks" | "modes";

export const localize = (
  namespace: DataNamespace,
  id: string,
  field: string,
  fallback: string,
): string =>
  i18n.t(`${namespace}:${id}.${field}`, { defaultValue: fallback });
