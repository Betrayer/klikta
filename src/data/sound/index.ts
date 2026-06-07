import type { SoundPack } from "../themes/types";
import { defaultSoundPack, DEFAULT_SOUND_PACK_ID } from "./defaultPack";
import { auroraSoundPack } from "./auroraPack";
import { bloomSoundPack } from "./bloomPack";
import { testSoundPack } from "./testPack";

export { DEFAULT_SOUND_PACK_ID };

export const DEFAULT_SOUND_PACK: SoundPack = defaultSoundPack;

export const SOUND_PACKS: Record<string, SoundPack> = {
  [defaultSoundPack.id]: defaultSoundPack,
  [auroraSoundPack.id]: auroraSoundPack,
  [bloomSoundPack.id]: bloomSoundPack,
  [testSoundPack.id]: testSoundPack,
};
