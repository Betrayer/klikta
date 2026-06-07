import { useTranslation } from "react-i18next";
import type { DataNamespace } from "./localize";

export const useLocalize = () => {
  const { t } = useTranslation();
  return (
    namespace: DataNamespace,
    id: string,
    field: string,
    fallback: string,
  ): string => t(`${namespace}:${id}.${field}`, { defaultValue: fallback });
};
