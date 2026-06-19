import type { SoundPack } from "../themes/types";
import { catsSoundPack } from "./catsPack";
import { defaultSoundPack, DEFAULT_SOUND_PACK_ID } from "./defaultPack";
import { gemsSoundPack } from "./gemsPack";
import { monstersSoundPack } from "./monstersPack";

export { DEFAULT_SOUND_PACK_ID };

export const DEFAULT_SOUND_PACK: SoundPack = defaultSoundPack;

export const SOUND_PACKS: Record<string, SoundPack> = {
  [defaultSoundPack.id]: defaultSoundPack,
  [gemsSoundPack.id]: gemsSoundPack,
  [catsSoundPack.id]: catsSoundPack,
  [monstersSoundPack.id]: monstersSoundPack,
};
