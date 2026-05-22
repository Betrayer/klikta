import type { GameContext, UltimateImpl } from "./types";
import { ScreenTint, tintEnvelope } from "./ScreenTint";

const GLITCH_COLORS = [0xff006e, 0x00f0ff, 0x9d4edd] as const;
const FALLBACK_COLOR = 0xff006e;
const PEAK_ALPHA = 0.24;

const pickGlitchColor = (): number => {
  const idx = Math.floor(Math.random() * GLITCH_COLORS.length);
  return GLITCH_COLORS[idx] ?? FALLBACK_COLOR;
};

class ChaosStormUltimate implements UltimateImpl {
  readonly id = "chaos-storm";
  readonly durationMs = 4000;
  readonly blocksOthers = true;
  private tint: ScreenTint | null = null;

  apply(ctx: GameContext): void {
    ctx.spawnSystem.setChaosMode(true);
    this.tint = new ScreenTint(
      ctx.overlay,
      ctx.app.renderer.screen,
      FALLBACK_COLOR,
      true,
    );
    ctx.shake(10, 300);
    ctx.audio.playSFX("combo_milestone");
    ctx.audio.musicSwell();
  }

  update(_ctx: GameContext, elapsedMs: number): void {
    if (this.tint === null) return;
    const env = tintEnvelope(elapsedMs, this.durationMs, PEAK_ALPHA, 200, 400);
    const jitter = 0.55 + Math.random() * 0.45;
    this.tint.setAlpha(env * jitter);
    this.tint.setColor(pickGlitchColor());
  }

  cleanup(ctx: GameContext): void {
    ctx.spawnSystem.setChaosMode(false);
    this.tint?.destroy();
    this.tint = null;
  }
}

export const createChaosStorm = (): UltimateImpl => new ChaosStormUltimate();
