import auroraRegular from "../../assets/themes/aurora/regular.png";
import auroraGolden from "../../assets/themes/aurora/golden.png";
import auroraBomb from "../../assets/themes/aurora/bomb.png";
import auroraMulti from "../../assets/themes/aurora/multi.png";
import auroraShielded from "../../assets/themes/aurora/shielded.png";
import auroraSplitter from "../../assets/themes/aurora/splitter.png";
import auroraSticky from "../../assets/themes/aurora/sticky.png";
import bloomRegular from "../../assets/themes/bloom/regular.png";
import bloomGolden from "../../assets/themes/bloom/golden.png";
import bloomBomb from "../../assets/themes/bloom/bomb.png";
import bloomMulti3 from "../../assets/themes/bloom/multi_3.png";
import bloomMulti2 from "../../assets/themes/bloom/multi_2.png";
import bloomMulti1 from "../../assets/themes/bloom/multi_1.png";
import bloomShieldUp from "../../assets/themes/bloom/shield_up.png";
import bloomShieldDown from "../../assets/themes/bloom/shield_down.png";
import bloomSplitter from "../../assets/themes/bloom/splitter.png";
import bloomSticky from "../../assets/themes/bloom/sticky.png";

export interface TextureAsset {
  alias: string;
  src: string;
}

export const THEME_TEXTURES: Record<string, TextureAsset[]> = {
  synthwave: [],
  aurora: [
    { alias: "aurora-regular", src: auroraRegular },
    { alias: "aurora-golden", src: auroraGolden },
    { alias: "aurora-bomb", src: auroraBomb },
    { alias: "aurora-multi", src: auroraMulti },
    { alias: "aurora-shielded", src: auroraShielded },
    { alias: "aurora-splitter", src: auroraSplitter },
    { alias: "aurora-sticky", src: auroraSticky },
  ],
  bloom: [
    { alias: "bloom-regular", src: bloomRegular },
    { alias: "bloom-golden", src: bloomGolden },
    { alias: "bloom-bomb", src: bloomBomb },
    { alias: "bloom-multi-3", src: bloomMulti3 },
    { alias: "bloom-multi-2", src: bloomMulti2 },
    { alias: "bloom-multi-1", src: bloomMulti1 },
    { alias: "bloom-shield-up", src: bloomShieldUp },
    { alias: "bloom-shield-down", src: bloomShieldDown },
    { alias: "bloom-splitter", src: bloomSplitter },
    { alias: "bloom-sticky", src: bloomSticky },
  ],
};
