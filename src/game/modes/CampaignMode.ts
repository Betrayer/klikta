import type { ModeId } from "../../data/modes";
import { WAVES } from "../../data/waves";
import { useCampaignStore } from "../../state/campaignStore";
import type {
  ModeContext,
  ModePolicy,
  ModeTickDirective,
  PenaltyKind,
} from "./ModePolicy";

type Phase = "spawning" | "clearing" | "break";
type Outcome = "none" | "won";

export class CampaignMode implements ModePolicy {
  readonly id: ModeId = "campaign";
  readonly initialTimeMs = 0;

  private waveIndex = 0;
  private waveElapsedMs = 0;
  private phase: Phase = "spawning";
  private planAppliedForWave = -1;
  private outcome: Outcome = "none";

  onRunStart(): void {
    this.waveIndex = 0;
    this.waveElapsedMs = 0;
    this.phase = "spawning";
    this.planAppliedForWave = -1;
    this.outcome = "none";
    useCampaignStore.getState().begin(WAVES.length);
  }

  onTick(deltaMs: number, ctx: ModeContext): ModeTickDirective | void {
    if (this.outcome !== "none" || this.phase === "break") return;

    const wave = WAVES[this.waveIndex];
    if (wave === undefined) {
      this.outcome = "won";
      return;
    }

    if (
      this.phase === "spawning" &&
      this.planAppliedForWave !== this.waveIndex
    ) {
      this.planAppliedForWave = this.waveIndex;
      this.waveElapsedMs = 0;
      useCampaignStore.getState().setWave(wave.index);
      return { wavePlan: wave.density };
    }

    if (this.phase === "spawning") {
      this.waveElapsedMs += deltaMs;
      if (this.waveElapsedMs >= wave.durationMs) {
        this.phase = "clearing";
        return { wavePlan: null };
      }
      return;
    }

    if (ctx.liveTargetCount > 0) return;

    if (this.waveIndex >= WAVES.length - 1) {
      this.outcome = "won";
      return;
    }

    this.phase = "break";
    return { startWaveBreak: { upcomingWave: this.waveIndex + 2 } };
  }

  isRunOver(ctx: ModeContext): boolean {
    return ctx.hp <= 0 || this.outcome === "won";
  }

  isVictory(): boolean {
    return this.outcome === "won";
  }

  onHit(): void {}

  onMiss(): PenaltyKind {
    return "hp";
  }

  onBombClick(): PenaltyKind {
    return "hp";
  }

  resumeFromBreak(): void {
    if (this.phase !== "break") return;
    this.waveIndex += 1;
    this.phase = "spawning";
  }
}
