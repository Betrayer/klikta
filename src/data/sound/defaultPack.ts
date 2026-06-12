import type { SoundPack } from "../themes/types";

import musicUrl from "../../assets/audio/music/music_synthwave_loop_1.mp3";

const sfxUrls = import.meta.glob("../../assets/audio/sfx/*.{mp3,ogg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const urlByFile = new Map<string, string>();
for (const [path, url] of Object.entries(sfxUrls)) {
  const file = path.split("/").pop();
  if (file !== undefined) urlByFile.set(file, url);
}

const sources = (baseName: string): string[] => {
  const ordered: string[] = [];
  const mp3 = urlByFile.get(`${baseName}.mp3`);
  const ogg = urlByFile.get(`${baseName}.ogg`);
  if (mp3 !== undefined) ordered.push(mp3);
  if (ogg !== undefined) ordered.push(ogg);
  return ordered;
};

const variants = (baseNames: string[]): string[][] => baseNames.map(sources);

export const DEFAULT_SOUND_PACK_ID = "default";

export const defaultSoundPack: SoundPack = {
  id: DEFAULT_SOUND_PACK_ID,
  name: "Synthwave",
  music: { src: musicUrl },
  sfx: {
    hit_regular: variants([
      "hit_regular_1",
      "hit_regular_2",
      "hit_regular_3",
      "hit_regular_4",
    ]),
    hit_golden: variants(["hit_golden"]),
    hit_multi_partial: variants(["hit_multi_partial_1", "hit_multi_partial_2"]),
    hit_multi_complete: variants(["hit_multi_partial_complete"]),
    hit_shielded_break: variants(["hit_shielded_break"]),
    hit_shielded: variants(["hit_shielded"]),
    hit_splitter: variants(["hit_splitter"]),
    hit_splitter_frag: variants([
      "hit_splitter_frag_1",
      "hit_splitter_frag_2",
      "hit_splitter_frag_3",
    ]),
    bomb_click: variants(["bomb_click"]),
    miss: variants(["miss"]),
    combo_milestone: variants(["combo_milestone"]),
    game_over: variants([]),
  },
};
