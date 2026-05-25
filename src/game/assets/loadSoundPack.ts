import { Howl } from "howler";
import { SOUND_PACKS, DEFAULT_SOUND_PACK_ID } from "../../data/sound";
import type { SfxName } from "../../data/themes/types";

export interface LoadedSoundPack {
  music: Howl;
  sfx: Map<SfxName, Howl[]>;
}

const cache = new Map<string, LoadedSoundPack>();

export const isSoundPackLoaded = (packId: string): boolean =>
  packId === DEFAULT_SOUND_PACK_ID || cache.has(packId);

export const getLoadedSoundPack = (packId: string): LoadedSoundPack | null =>
  cache.get(packId) ?? null;

const loadHowl = (src: string): Promise<Howl> =>
  new Promise<Howl>((resolve, reject) => {
    const howl = new Howl({ src: [src] });
    if (howl.state() === "loaded") {
      resolve(howl);
      return;
    }
    howl.once("load", () => resolve(howl));
    howl.once("loaderror", (_id, error) => {
      reject(error instanceof Error ? error : new Error(String(error)));
    });
  });

export const loadSoundPack = async (packId: string): Promise<void> => {
  if (isSoundPackLoaded(packId)) return;
  const pack = SOUND_PACKS[packId];
  if (pack === undefined) return;

  const entries = Object.entries(pack.sfx) as [SfxName, string[]][];
  const [music, sfxEntries] = await Promise.all([
    loadHowl(pack.music.src),
    Promise.all(
      entries.map(
        async ([name, srcs]) =>
          [name, await Promise.all(srcs.map(loadHowl))] as const,
      ),
    ),
  ]);

  cache.set(packId, { music, sfx: new Map<SfxName, Howl[]>(sfxEntries) });
};
