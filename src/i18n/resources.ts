export type LeafResource = { [key: string]: string | LeafResource };

export interface NamespaceBundle {
  namespace: string;
  resource: LeafResource;
}

const localeModules = import.meta.glob<{ default: unknown }>(
  "../locales/*/*.json",
);

const isLeafResource = (value: unknown): value is LeafResource => {
  if (typeof value !== "object" || value === null) return false;
  return Object.values(value).every(
    (entry) => typeof entry === "string" || isLeafResource(entry),
  );
};

export const loadLanguageBundles = async (
  lang: string,
): Promise<ReadonlyArray<NamespaceBundle>> => {
  const bundles: NamespaceBundle[] = [];
  for (const [path, importer] of Object.entries(localeModules)) {
    const match = /\/locales\/([^/]+)\/([^/]+)\.json$/.exec(path);
    if (match === null) continue;
    const fileLang = match[1];
    const namespace = match[2];
    if (fileLang !== lang || namespace === undefined) continue;
    const mod = await importer();
    const data: unknown = mod.default;
    if (!isLeafResource(data)) continue;
    bundles.push({ namespace, resource: data });
  }
  return bundles;
};
