import gemsRegular from "../../assets/themes/gems/regular.png";
import gemsGolden from "../../assets/themes/gems/golden.png";
import gemsBomb from "../../assets/themes/gems/bomb.png";
import gemsMulti3 from "../../assets/themes/gems/multi_3.png";
import gemsMulti2 from "../../assets/themes/gems/multi_2.png";
import gemsMulti1 from "../../assets/themes/gems/multi_1.png";
import gemsShieldUp from "../../assets/themes/gems/shield_up.png";
import gemsShieldDown from "../../assets/themes/gems/shield_down.png";
import gemsSplitter from "../../assets/themes/gems/splitter.png";
import gemsSticky from "../../assets/themes/gems/sticky.png";
import gemsFrag1 from "../../assets/themes/gems/splitter_frag1.png";
import gemsFrag2 from "../../assets/themes/gems/splitter_frag2.png";
import gemsFrag3 from "../../assets/themes/gems/splitter_frag3.png";

export interface TextureAsset {
  alias: string;
  src: string;
}

export const THEME_TEXTURES: Record<string, TextureAsset[]> = {
  synthwave: [],
  daybreak: [],
  slate: [],
  gems: [
    { alias: "gems-regular", src: gemsRegular },
    { alias: "gems-golden", src: gemsGolden },
    { alias: "gems-bomb", src: gemsBomb },
    { alias: "gems-multi-3", src: gemsMulti3 },
    { alias: "gems-multi-2", src: gemsMulti2 },
    { alias: "gems-multi-1", src: gemsMulti1 },
    { alias: "gems-shield-up", src: gemsShieldUp },
    { alias: "gems-shield-down", src: gemsShieldDown },
    { alias: "gems-splitter", src: gemsSplitter },
    { alias: "gems-sticky", src: gemsSticky },
    { alias: "gems-frag1", src: gemsFrag1 },
    { alias: "gems-frag2", src: gemsFrag2 },
    { alias: "gems-frag3", src: gemsFrag3 },
  ],
};
