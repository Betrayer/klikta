import type { SoundPack } from "../themes/types";
import { defaultSoundPack } from "./defaultPack";

export const AURORA_SOUND_PACK_ID = "aurora";

export const auroraSoundPack: SoundPack = {
  ...defaultSoundPack,
  id: AURORA_SOUND_PACK_ID,
  name: "Aurora",
  gain: 1.05,
  rate: 0.9,
};
