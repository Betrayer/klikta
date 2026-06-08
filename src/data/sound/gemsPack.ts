import type { SfxName, SoundPack } from "../themes/types";
import { defaultSoundPack } from "./defaultPack";

export const GEMS_SOUND_PACK_ID = "gems";

const urls = import.meta.glob("../../assets/audio/packs/gems/*.{mp3,wav,ogg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const byName = new Map<string, string>();
for (const [path, url] of Object.entries(urls)) {
  const file = path.split("/").pop();
  if (file !== undefined) byName.set(file.replace(/\.[^.]+$/, ""), url);
}

const one = (name: string): string[] | undefined => {
  const url = byName.get(name);
  return url !== undefined ? [url] : undefined;
};

const variants = (names: string[]): string[][] => {
  const out: string[][] = [];
  for (const name of names) {
    const v = one(name);
    if (v !== undefined) out.push(v);
  }
  return out;
};

const sfx: Record<SfxName, string[][]> = { ...defaultSoundPack.sfx };
const regular = one("regular");
if (regular !== undefined) sfx.hit_regular = [regular];
const golden = one("golden");
if (golden !== undefined) sfx.hit_golden = [golden];
const bomb = one("bomb");
if (bomb !== undefined) sfx.bomb_click = [bomb];
const multiPartial = variants(["multi0", "multi1"]);
if (multiPartial.length > 0) sfx.hit_multi_partial = multiPartial;
const multiComplete = one("multi2");
if (multiComplete !== undefined) sfx.hit_multi_complete = [multiComplete];
const shieldBreak = variants(["shielded0", "shielded1"]);
if (shieldBreak.length > 0) sfx.hit_shielded_break = shieldBreak;

const music = byName.get("bg1");

export const gemsSoundPack: SoundPack = {
  ...defaultSoundPack,
  id: GEMS_SOUND_PACK_ID,
  name: "Gems",
  sfx,
  music: { src: music ?? defaultSoundPack.music.src },
};
