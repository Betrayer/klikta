import type { ModeId } from "../../data/modes";
import type { TargetKind } from "../../data/targetConfig";

export type PenaltyKind = "hp" | "none";

export interface ModeContext {
  readonly elapsedMs: number;
  readonly score: number;
  readonly hp: number;
  readonly timeRemainingMs: number;
}

export interface ModePolicy {
  readonly id: ModeId;
  readonly initialTimeMs: number;
  onRunStart(): void;
  onTick(deltaMs: number, ctx: ModeContext): void;
  isRunOver(ctx: ModeContext): boolean;
  onHit(ctx: ModeContext, kind: TargetKind): void;
  onMiss(ctx: ModeContext): PenaltyKind;
  onBombClick(ctx: ModeContext): PenaltyKind;
}
