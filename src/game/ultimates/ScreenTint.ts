import { Container, Graphics } from "pixi.js";
import { tweenManager } from "../util/TweenManager";
import { easeOutCubic } from "../util/easings";

interface ScreenSize {
  width: number;
  height: number;
}

// Drawn larger than the screen so camera shake never reveals the edges.
const OVERSIZE = 80;

// Fade-in / hold / fade-out alpha envelope driven by an ultimate's elapsed
// game-time. Deterministic and pause-safe (advances only with the ticker).
export const tintEnvelope = (
  elapsedMs: number,
  durationMs: number,
  peakAlpha: number,
  fadeInMs: number,
  fadeOutMs: number,
): number => {
  if (elapsedMs <= 0) return 0;
  if (elapsedMs < fadeInMs) return peakAlpha * (elapsedMs / fadeInMs);
  const fadeOutStart = durationMs - fadeOutMs;
  if (elapsedMs >= fadeOutStart) {
    return peakAlpha * Math.max((durationMs - elapsedMs) / fadeOutMs, 0);
  }
  return peakAlpha;
};

// Full-screen colored overlay. Filled white and recolored via tint so color
// changes (e.g. ChaosStorm glitch) are cheap and need no redraw.
export class ScreenTint {
  readonly gfx: Graphics;

  constructor(
    parent: Container,
    screen: ScreenSize,
    color: number,
    additive = false,
  ) {
    const gfx = new Graphics();
    gfx.eventMode = "none";
    if (additive) gfx.blendMode = "add";
    gfx
      .rect(
        -OVERSIZE,
        -OVERSIZE,
        screen.width + OVERSIZE * 2,
        screen.height + OVERSIZE * 2,
      )
      .fill(0xffffff);
    gfx.tint = color;
    gfx.alpha = 0;
    parent.addChild(gfx);
    this.gfx = gfx;
  }

  setAlpha(alpha: number): void {
    this.gfx.alpha = alpha;
  }

  setColor(color: number): void {
    this.gfx.tint = color;
  }

  destroy(): void {
    this.gfx.removeFromParent();
    this.gfx.destroy();
  }

  // One-shot self-removing flash. Used by instant ultimates (Restore) whose
  // apply/cleanup run back-to-back, so they cannot animate via update().
  static flash(
    parent: Container,
    screen: ScreenSize,
    color: number,
    peakAlpha: number,
    durationMs: number,
    additive = false,
  ): void {
    const tint = new ScreenTint(parent, screen, color, additive);
    const upMs = Math.max(durationMs * 0.25, 1);
    tweenManager.to(
      0,
      peakAlpha,
      upMs,
      (v) => tint.setAlpha(v),
      easeOutCubic,
      () => {
        tweenManager.to(
          peakAlpha,
          0,
          Math.max(durationMs - upMs, 1),
          (v) => tint.setAlpha(v),
          easeOutCubic,
          () => tint.destroy(),
        );
      },
    );
  }
}
