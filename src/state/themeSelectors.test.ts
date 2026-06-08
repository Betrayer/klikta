import { describe, expect, it } from "vitest";
import { synthwaveTheme } from "../data/themes/synthwave";
import { gemsTheme } from "../data/themes/gems";
import { DEFAULT_HUD_SPEC, DEFAULT_VFX_STYLE } from "../data/themes/defaults";
import {
  getBackgroundSpec,
  getCursorSpec,
  getHudSpec,
  getTargetStateTextures,
  getTransitions,
  getVfxStyle,
} from "./themeSelectors";

describe("theme defaults preserve current behavior", () => {
  it("uses the framed HUD preset for the vector bundled themes", () => {
    expect(synthwaveTheme.hud.style).toBe("framed");
    expect(gemsTheme.hud.style).toBe("framed");
  });

  it("keeps the heart-based HP readout in the default HUD", () => {
    expect(DEFAULT_HUD_SPEC.hp.type).toBe("hearts");
    expect(DEFAULT_HUD_SPEC.hp.position).toBe("top-right");
  });

  it("keeps the wave indicator on the info accent in the default HUD", () => {
    expect(DEFAULT_HUD_SPEC.wave.accent).toBe("info");
    expect(DEFAULT_HUD_SPEC.wave.position).toBe("top-center");
  });

  it("leaves the optional theme sections unset on bundled themes", () => {
    expect(synthwaveTheme.vfx).toBeUndefined();
    expect(synthwaveTheme.cursor).toBeUndefined();
    expect(synthwaveTheme.transitions).toBeUndefined();
  });
});

describe("theme selectors", () => {
  it("returns the active theme HUD spec", () => {
    expect(getHudSpec().style).toBe("framed");
  });

  it("returns the active theme background spec", () => {
    expect(getBackgroundSpec().kind).toBe("animated_gradient");
  });

  it("fills VFX defaults when a theme omits the vfx section", () => {
    expect(getVfxStyle()).toEqual(DEFAULT_VFX_STYLE);
  });

  it("returns no cursor for themes that do not declare one", () => {
    expect(getCursorSpec()).toBeUndefined();
  });

  it("returns no transitions for themes that do not declare them", () => {
    expect(getTransitions()).toBeUndefined();
  });

  it("returns no state textures for vector targets", () => {
    expect(getTargetStateTextures("shielded")).toBeUndefined();
  });
});
