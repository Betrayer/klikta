import type { GameContext, UltimateImpl } from "./types";
import { ScreenTint, tintEnvelope } from "./ScreenTint";

// Greed T4: every hit spawns two extra short-lived targets nearby (handled by
// SpawnSystem.onTargetHit) and all score is doubled while active.
const TINT_COLOR = 0xff6b35;
const PEAK_ALPHA = 0.18;
const SCORE_MUL = 2;

class FrenzyUltimate implements UltimateImpl {
  readonly id = "frenzy";
  readonly durationMs = 8000;
  readonly blocksOthers = true;
  private tint: ScreenTint | null = null;
  private prevMultiplier = 1;

  apply(ctx: GameContext): void {
    this.prevMultiplier = ctx.scoreMultiplier.current;
    ctx.scoreMultiplier.current = this.prevMultiplier * SCORE_MUL;
    ctx.spawnSystem.setFrenzy(true);
    this.tint = new ScreenTint(
      ctx.overlay,
      ctx.app.renderer.screen,
      TINT_COLOR,
      true,
    );
    ctx.shake(8, 260);
    ctx.audio.playSFX("combo_milestone");
    ctx.audio.musicSwell();
  }

  update(_ctx: GameContext, elapsedMs: number): void {
    this.tint?.setAlpha(
      tintEnvelope(elapsedMs, this.durationMs, PEAK_ALPHA, 300, 500),
    );
  }

  cleanup(ctx: GameContext): void {
    ctx.spawnSystem.setFrenzy(false);
    ctx.scoreMultiplier.current = this.prevMultiplier;
    this.tint?.destroy();
    this.tint = null;
  }
}

export const createFrenzy = (): UltimateImpl => new FrenzyUltimate();
