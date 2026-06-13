import type { SfxName, SoundPack } from "../themes/types";
import { defaultSoundPack } from "./defaultPack";

export const MONSTERS_SOUND_PACK_ID = "monsters";

const urls = import.meta.glob(
  "../../assets/audio/packs/monsters/*.{mp3,wav,ogg}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

const urlByBaseName = new Map<string, string[]>();
for (const [path, url] of Object.entries(urls)) {
  const fileName = path.split("/").pop()!;
  const baseName = fileName.replace(/\.[^.]+$/, "");
  if (!urlByBaseName.has(baseName)) urlByBaseName.set(baseName, []);
  urlByBaseName.get(baseName)!.push(url);
}

const getVariants = (baseName: string): string[][] => {
  const variants: string[][] = [];
  let i = 1;

  if (urlByBaseName.has(baseName)) {
    variants.push(urlByBaseName.get(baseName)!);
  }

  while (urlByBaseName.has(`${baseName}_${i}`)) {
    variants.push(urlByBaseName.get(`${baseName}_${i}`)!);
    i++;
  }
  return variants;
};

const sfx: Record<SfxName, string[][]> = { ...defaultSoundPack.sfx };

const regular = getVariants("hit_regular");
if (regular.length > 0) sfx.hit_regular = regular;

sfx.hit_golden = urlByBaseName.has("hit_golden")
  ? [urlByBaseName.get("hit_golden")!]
  : sfx.hit_golden;
sfx.hit_multi_partial = getVariants("hit_multi_partial");
sfx.hit_multi_complete = urlByBaseName.has("hit_multi_partial_complete")
  ? [urlByBaseName.get("hit_multi_partial_complete")!]
  : sfx.hit_multi_complete;
sfx.hit_shielded_break = urlByBaseName.has("hit_shielded_break")
  ? [urlByBaseName.get("hit_shielded_break")!]
  : sfx.hit_shielded_break;
sfx.hit_shielded = urlByBaseName.has("hit_shielded")
  ? [urlByBaseName.get("hit_shielded")!]
  : sfx.hit_shielded;
sfx.hit_splitter = urlByBaseName.has("hit_splitter")
  ? [urlByBaseName.get("hit_splitter")!]
  : sfx.hit_splitter;

const frag1 = urlByBaseName.get("hit_splitter_frag_1");
const frag2 = urlByBaseName.get("hit_splitter_frag_2");
const frag3 = urlByBaseName.get("hit_splitter_frag_3");
if (frag1 || frag2 || frag3) {
  sfx.hit_splitter_frag = [frag1 || [], frag2 || [], frag3 || []];
}

sfx.bomb_click = urlByBaseName.has("bomb_click")
  ? [urlByBaseName.get("bomb_click")!]
  : sfx.bomb_click;
sfx.miss = urlByBaseName.has("miss") ? [urlByBaseName.get("miss")!] : sfx.miss;
sfx.combo_milestone = urlByBaseName.has("combo_milestone")
  ? [urlByBaseName.get("combo_milestone")!]
  : sfx.combo_milestone;

export const monstersSoundPack: SoundPack = {
  ...defaultSoundPack,
  id: MONSTERS_SOUND_PACK_ID,
  name: "Monsters",
  sfx,
  music: { src: urlByBaseName.get("bg1")?.[0] ?? defaultSoundPack.music.src },
};
