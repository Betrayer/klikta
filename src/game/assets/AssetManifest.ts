import auroraRegular from "../../assets/themes/aurora/regular.png";
import auroraGolden from "../../assets/themes/aurora/golden.png";
import auroraBomb from "../../assets/themes/aurora/bomb.png";
import auroraMulti from "../../assets/themes/aurora/multi.png";
import auroraShielded from "../../assets/themes/aurora/shielded.png";
import auroraSplitter from "../../assets/themes/aurora/splitter.png";
import auroraSticky from "../../assets/themes/aurora/sticky.png";

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
};
