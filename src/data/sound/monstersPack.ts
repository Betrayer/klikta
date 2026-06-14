import type { SfxName, SoundPack } from "../themes/types";
import { defaultSoundPack } from "./defaultPack";

export const MONSTERS_SOUND_PACK_ID = "monsters";

const regularUrls = import.meta.glob(
  "../../assets/audio/packs/monsters/*.{mp3,wav,ogg}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

const commentUrls = import.meta.glob(
  "../../assets/audio/packs/monsters/comments/*.{mp3,wav,ogg}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

const buildBaseNameMap = (
  urls: Record<string, string>,
  stripPrefix?: string,
): Map<string, string[]> => {
  const map = new Map<string, string[]>();
  for (const [path, url] of Object.entries(urls)) {
    let fileName = path.split("/").pop()!;
    let baseName = fileName.replace(/\.[^.]+$/, "");

    if (stripPrefix && baseName.startsWith(stripPrefix)) {
      baseName = baseName.slice(stripPrefix.length);
    }

    if (!map.has(baseName)) map.set(baseName, []);
    map.get(baseName)!.push(url);
  }
  return map;
};

const urlByBaseName = buildBaseNameMap(regularUrls);
const commentsByBaseName = buildBaseNameMap(commentUrls, "comment_");

const getVariants = (baseName: string): string[][] => {
  const variants: string[][] = [];

  if (urlByBaseName.has(baseName)) {
    variants.push(urlByBaseName.get(baseName)!);
  }

  let i = 1;
  while (urlByBaseName.has(`${baseName}_${i}`)) {
    variants.push(urlByBaseName.get(`${baseName}_${i}`)!);
    i++;
  }

  return variants;
};

const COMMENT_FREQUENCY = 4;

const getWeightedVariants = (baseName: string): string[][] => {
  const variants: string[][] = [];
  const allComments: string[][] = [];

  const addVariant = (name: string) => {
    const regular = urlByBaseName.get(name);
    const comment = commentsByBaseName.get(name);

    if (regular) {
      for (let k = 0; k < COMMENT_FREQUENCY; k++) variants.push(regular);
    }

    if (comment) {
      allComments.push(comment);
    }
  };

  addVariant(baseName);
  let i = 1;
  while (
    urlByBaseName.has(`${baseName}_${i}`) ||
    commentsByBaseName.has(`${baseName}_${i}`)
  ) {
    addVariant(`${baseName}_${i}`);
    i++;
  }

  variants.push(...allComments);

  return variants;
};

const sfx: Record<SfxName, string[][]> = { ...defaultSoundPack.sfx };

const targetsWithComments = [
  "hit_regular",
  "hit_golden",
  "hit_shielded_break",
  "hit_splitter",
  "bomb_click",
  "game_over",
  "sticky",
];

targetsWithComments.forEach((t) => {
  const variants = getWeightedVariants(t);
  if (variants.length > 0) sfx[t as SfxName] = variants;
});

const targetsWithoutComments = ["hit_shielded", "hit_multi_partial", "miss"];

targetsWithoutComments.forEach((t) => {
  const variants = getVariants(t);
  if (variants.length > 0) sfx[t as SfxName] = variants;
});

const multiComplete = getWeightedVariants("hit_multi_partial_complete");
if (multiComplete.length > 0) sfx.hit_multi_complete = multiComplete;

const combo2 = urlByBaseName.get("combo_milestone_2");
const combo3 = urlByBaseName.get("combo_milestone_3");
if (combo2 || combo3) {
  const comboVariants: string[][] = [];
  if (combo2) comboVariants.push(combo2);
  if (combo3) comboVariants.push(combo3);
  if (comboVariants.length > 0) sfx.combo_milestone = comboVariants;
}

const frag1 = urlByBaseName.get("hit_splitter_frag_1");
const frag2 = urlByBaseName.get("hit_splitter_frag_2");
const frag3 = urlByBaseName.get("hit_splitter_frag_3");
if (frag1 || frag2 || frag3) {
  sfx.hit_splitter_frag = [frag1 || [], frag2 || [], frag3 || []];
}

export const monstersSoundPack: SoundPack = {
  ...defaultSoundPack,
  id: MONSTERS_SOUND_PACK_ID,
  name: "Monsters",
  sfx,
  music: { src: urlByBaseName.get("bg1")?.[0] ?? defaultSoundPack.music.src },
};
