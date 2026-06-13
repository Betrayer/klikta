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
import catsRegular from "../../assets/themes/cats/regular.png";
import catsGolden from "../../assets/themes/cats/golden.png";
import catsBomb from "../../assets/themes/cats/bomb.png";
import catsMulti3 from "../../assets/themes/cats/multi_3.png";
import catsMulti2 from "../../assets/themes/cats/multi_2.png";
import catsMulti1 from "../../assets/themes/cats/multi_1.png";
import catsShieldUp from "../../assets/themes/cats/shield_up.png";
import catsShieldDown from "../../assets/themes/cats/shield_down.png";
import catsSplitter from "../../assets/themes/cats/splitter.png";
import catsSticky from "../../assets/themes/cats/sticky.png";
import catsFrag1 from "../../assets/themes/cats/splitter_frag1.png";
import catsFrag2 from "../../assets/themes/cats/splitter_frag2.png";
import catsFrag3 from "../../assets/themes/cats/splitter_frag3.png";
import monstersRegular from "../../assets/themes/monsters/regular.png";
import monstersGolden from "../../assets/themes/monsters/golden.png";
import monstersBomb from "../../assets/themes/monsters/bomb.png";
import monstersMulti3 from "../../assets/themes/monsters/multi_3.png";
import monstersMulti2 from "../../assets/themes/monsters/multi_2.png";
import monstersMulti1 from "../../assets/themes/monsters/multi_1.png";
import monstersShieldUp from "../../assets/themes/monsters/shield_up.png";
import monstersShieldDown from "../../assets/themes/monsters/shield_down.png";
import monstersSplitter from "../../assets/themes/monsters/splitter.png";
import monstersSticky from "../../assets/themes/monsters/sticky.png";
import monstersFrag1 from "../../assets/themes/monsters/splitter_frag1.png";
import monstersFrag2 from "../../assets/themes/monsters/splitter_frag2.png";
import monstersFrag3 from "../../assets/themes/monsters/splitter_frag3.png";

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
  cats: [
    { alias: "cats-regular", src: catsRegular },
    { alias: "cats-golden", src: catsGolden },
    { alias: "cats-bomb", src: catsBomb },
    { alias: "cats-multi-3", src: catsMulti3 },
    { alias: "cats-multi-2", src: catsMulti2 },
    { alias: "cats-multi-1", src: catsMulti1 },
    { alias: "cats-shield-up", src: catsShieldUp },
    { alias: "cats-shield-down", src: catsShieldDown },
    { alias: "cats-splitter", src: catsSplitter },
    { alias: "cats-sticky", src: catsSticky },
    { alias: "cats-frag1", src: catsFrag1 },
    { alias: "cats-frag2", src: catsFrag2 },
    { alias: "cats-frag3", src: catsFrag3 },
  ],
  monsters: [
    { alias: "monsters-regular", src: monstersRegular },
    { alias: "monsters-golden", src: monstersGolden },
    { alias: "monsters-bomb", src: monstersBomb },
    { alias: "monsters-multi-3", src: monstersMulti3 },
    { alias: "monsters-multi-2", src: monstersMulti2 },
    { alias: "monsters-multi-1", src: monstersMulti1 },
    { alias: "monsters-shield-up", src: monstersShieldUp },
    { alias: "monsters-shield-down", src: monstersShieldDown },
    { alias: "monsters-splitter", src: monstersSplitter },
    { alias: "monsters-sticky", src: monstersSticky },
    { alias: "monsters-frag1", src: monstersFrag1 },
    { alias: "monsters-frag2", src: monstersFrag2 },
    { alias: "monsters-frag3", src: monstersFrag3 },
  ],
};
