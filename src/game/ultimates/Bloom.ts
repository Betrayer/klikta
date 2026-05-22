import type { GameContext, UltimateImpl } from "./types";
import { ScreenTint, tintEnvelope } from "./ScreenTint";
import { bloomState } from "./BloomState";

const TINT_COLOR = 0xff8fcf;
const PEAK_ALPHA = 0.2;
const SCORE_MUL = 2;
const SPAWN_RATE_MUL = 2;

class BloomUltimate implements UltimateImpl {
  readonly id = "bloom";
  readonly durationMs = 5000;
  readonly blocksOthers = true;
  private tint: ScreenTint | null = null;
  private prevMultiplier = 1;

  apply(ctx: GameContext): void {
    bloomState.active = true;
    this.prevMultiplier = ctx.scoreMultiplier.current;
    ctx.scoreMultiplier.current = this.prevMultiplier * SCORE_MUL;
    ctx.spawnSystem.setRateMultiplier(SPAWN_RATE_MUL);

    const screen = ctx.app.renderer.screen;
    this.tint = new ScreenTint(ctx.overlay, screen, TINT_COLOR, true);
    for (const target of ctx.targets) {
      ctx.vfx.emitHit(target.x, target.y, TINT_COLOR);
    }
    ctx.shake(7, 240);
    ctx.audio.playSFX("combo_milestone");
    ctx.audio.musicSwell();
  }

  update(_ctx: GameContext, elapsedMs: number): void {
    this.tint?.setAlpha(
      tintEnvelope(elapsedMs, this.durationMs, PEAK_ALPHA, 400, 500),
    );
  }

  cleanup(ctx: GameContext): void {
    bloomState.active = false;
    ctx.scoreMultiplier.current = this.prevMultiplier;
    ctx.spawnSystem.setRateMultiplier(1);
    this.tint?.destroy();
    this.tint = null;
  }
}

export const createBloom = (): UltimateImpl => new BloomUltimate();
