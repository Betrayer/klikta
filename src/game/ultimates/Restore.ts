import { useRunStore } from "../../state/runStore";
import type { GameContext, UltimateImpl } from "./types";
import { ScreenTint } from "./ScreenTint";

const HEAL_COLOR = 0x52ffb8;

class RestoreUltimate implements UltimateImpl {
  readonly id = "restore";
  readonly durationMs = 500;
  readonly blocksOthers = false;

  apply(ctx: GameContext): void {
    useRunStore.getState().fullHeal();
    ctx.disableHpRegen();

    const screen = ctx.app.renderer.screen;
    ScreenTint.flash(ctx.overlay, screen, HEAL_COLOR, 0.4, 450, true);
    ctx.vfx.emitMilestone(screen.width / 2, screen.height / 2);
    ctx.shake(5, 200);
    ctx.audio.playSFX("combo_milestone");
    ctx.audio.musicSwell();
  }

  cleanup(): void {}
}

export const createRestore = (): UltimateImpl => new RestoreUltimate();
