import type { TargetKind } from "../targetConfig";
import type { TargetStateTextures, TargetVisual, Theme } from "./types";
import { synthwaveTheme } from "./synthwave";
import { TEST_SOUND_PACK_ID } from "../sound/testPack";

export const TEST_THEME_ID = "test";

const urls = import.meta.glob("../../assets/themes/test/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const byName = new Map<string, string>();
for (const [path, url] of Object.entries(urls)) {
  const file = path.split("/").pop();
  if (file !== undefined) byName.set(file.replace(/\.png$/, ""), url);
}

export const TEST_THEME_TEXTURES = [...byName.entries()].map(([name, src]) => ({
  alias: `test-${name}`,
  src,
}));

const aliasOf = (name: string): string | undefined =>
  byName.has(name) ? `test-${name}` : undefined;

const base = synthwaveTheme.targets;

const singleVisual = (kind: TargetKind, name: string): TargetVisual => {
  const alias = aliasOf(name);
  if (alias === undefined) return base[kind];
  return { mode: "sprite", texture: alias, color: base[kind].color };
};

const statefulVisual = (
  kind: TargetKind,
  pairs: [keyof TargetStateTextures, string][],
): TargetVisual => {
  const states: TargetStateTextures = {};
  let primary: string | undefined;
  for (const [stateKey, name] of pairs) {
    const alias = aliasOf(name);
    if (alias === undefined) continue;
    states[stateKey] = alias;
    if (primary === undefined) primary = alias;
  }
  if (primary === undefined) return base[kind];
  return { mode: "sprite", texture: primary, color: base[kind].color, states };
};

export const testTheme: Theme = {
  ...synthwaveTheme,
  id: TEST_THEME_ID,
  name: "Test",
  defaultSoundPack: TEST_SOUND_PACK_ID,
  targets: {
    regular: singleVisual("regular", "regular"),
    golden: singleVisual("golden", "golden"),
    bomb: singleVisual("bomb", "bomb"),
    multi: statefulVisual("multi", [
      ["multi_3", "multi2"],
      ["multi_2", "multi1"],
      ["multi_1", "multi0"],
    ]),
    shielded: statefulVisual("shielded", [
      ["shield_up", "shielded1"],
      ["shield_down", "shielded0"],
    ]),
    splitter: singleVisual("splitter", "splitter00"),
    sticky: singleVisual("sticky", "sticky"),
  },
};
