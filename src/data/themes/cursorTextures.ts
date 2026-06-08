const cursorUrls = import.meta.glob(
  "../../assets/themes/*/cursor*.{png,svg}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const buildCursorTextures = (): Record<string, string> => {
  const registry: Record<string, string> = {};
  for (const [path, url] of Object.entries(cursorUrls)) {
    const segments = path.split("/");
    const file = segments[segments.length - 1];
    const themeId = segments[segments.length - 2];
    if (file === undefined || themeId === undefined) continue;
    const baseName = file.replace(/\.(png|svg)$/, "").replace(/_/g, "-");
    registry[`${themeId}-${baseName}`] = url;
  }
  return registry;
};

export const CURSOR_TEXTURES: Record<string, string> = buildCursorTextures();

export const resolveCursorValue = (
  key: string | undefined,
  registry: Record<string, string>,
): string | undefined => {
  if (key === undefined) return undefined;
  const url = registry[key];
  return url !== undefined ? `url(${url}), auto` : undefined;
};
