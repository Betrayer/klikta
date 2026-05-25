import type { SoundPack } from "../themes/types";

import musicUrl from "../../assets/audio/music/music_synthwave_loop_1.mp3";
import hitRegular1 from "../../assets/audio/sfx/hit_regular_1.ogg?url";
import hitRegular2 from "../../assets/audio/sfx/hit_regular_2.ogg?url";
import hitRegular3 from "../../assets/audio/sfx/hit_regular_3.ogg?url";
import hitRegular4 from "../../assets/audio/sfx/hit_regular_4.ogg?url";
import hitGolden from "../../assets/audio/sfx/hit_golden.ogg?url";
import hitMultiPartial from "../../assets/audio/sfx/hit_multi_partial.ogg?url";
import hitMultiComplete from "../../assets/audio/sfx/hit_multi_complete.ogg?url";
import hitShieldedBreak from "../../assets/audio/sfx/hit_shielded_break.ogg?url";
import bombClick from "../../assets/audio/sfx/bomb_click.ogg?url";
import miss from "../../assets/audio/sfx/miss.ogg?url";
import comboMilestone from "../../assets/audio/sfx/combo_milestone.ogg?url";

export const DEFAULT_SOUND_PACK_ID = "default";

export const defaultSoundPack: SoundPack = {
  id: DEFAULT_SOUND_PACK_ID,
  name: "Synthwave",
  music: { src: musicUrl },
  sfx: {
    hit_regular: [hitRegular1, hitRegular2, hitRegular3, hitRegular4],
    hit_golden: [hitGolden],
    hit_multi_partial: [hitMultiPartial],
    hit_multi_complete: [hitMultiComplete],
    hit_shielded_break: [hitShieldedBreak],
    bomb_click: [bombClick],
    miss: [miss],
    combo_milestone: [comboMilestone],
    game_over: [],
  },
};
