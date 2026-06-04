import type { SoundPack } from "../themes/types";
import { defaultSoundPack } from "./defaultPack";

export const BLOOM_SOUND_PACK_ID = "bloom";

export const bloomSoundPack: SoundPack = {
  ...defaultSoundPack,
  id: BLOOM_SOUND_PACK_ID,
  name: "Bloom",
  gain: 0.92,
  rate: 1.05,
};
