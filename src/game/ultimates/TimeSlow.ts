import type { GameContext, UltimateImpl } from "./types";
import { ScreenTint, tintEnvelope } from "./ScreenTint";

// Reaction T4: halve game speed, giving the player far more reaction time.
// NOTE: duration is measured in game-time, which is itself slowed — at 0.5x
// the window lasts ~10s of wall time. Tune in the balance pass (Task 9).
const SLOW_SCALE = 0.5;
const TINT_COLOR = 0x4cc9f0;
const PEAK_ALPHA = 0.22;
const FADE_MS = 400;

class TimeSlowUltimate implements UltimateImpl {
  readonly id = "time-slow";
  readonly durationMs = 5000;
  readonly blocksOthers = true;
  private tint: ScreenTint | null = null;

  apply(ctx: GameContext): void {
    ctx.setTimeScale(SLOW_SCALE);
    this.tint = new ScreenTint(ctx.overlay, ctx.app.renderer.screen, TINT_COLOR);
    ctx.shake(6, 220);
    ctx.audio.playSFX("combo_milestone");
    ctx.audio.musicSwell();
  }

  update(_ctx: GameContext, elapsedMs: number): void {
    this.tint?.setAlpha(
      tintEnvelope(elapsedMs, this.durationMs, PEAK_ALPHA, FADE_MS, FADE_MS),
    );
  }

  cleanup(ctx: GameContext): void {
    ctx.setTimeScale(1);
    this.tint?.destroy();
    this.tint = null;
  }
}

export const createTimeSlow = (): UltimateImpl => new TimeSlowUltimate();
