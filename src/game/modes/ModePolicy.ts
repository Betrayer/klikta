import type { ModeId } from "../../data/modes";
import type { TargetKind } from "../../data/targetConfig";
import type { WaveDensity } from "../../data/waves";

export type PenaltyKind = "hp" | "none";

export interface ModeContext {
  readonly elapsedMs: number;
  readonly score: number;
  readonly hp: number;
  readonly timeRemainingMs: number;
  readonly liveTargetCount: number;
}

export type DraftTier = 1 | 2 | 3;

export type WaveBreakDraft =
  | { kind: "perk"; tier: DraftTier }
  | { kind: "ultimate" };

export interface ModeTickDirective {
  wavePlan?: WaveDensity | null;
  startWaveBreak?: { upcomingWave: number; draft: WaveBreakDraft };
}

export interface ModePolicy {
  readonly id: ModeId;
  readonly initialTimeMs: number;
  readonly usesMetaPerks: boolean;
  onRunStart(): void;
  onTick(deltaMs: number, ctx: ModeContext): ModeTickDirective | void;
  isRunOver(ctx: ModeContext): boolean;
  isVictory(ctx: ModeContext): boolean;
  onHit(ctx: ModeContext, kind: TargetKind): void;
  onMiss(ctx: ModeContext): PenaltyKind;
  onBombClick(ctx: ModeContext): PenaltyKind;
  resumeFromBreak(): void;
}
