import type { ModeId } from "../../data/modes";

export type PenaltyKind = "hp" | "none";

export interface ModeContext {
  readonly elapsedMs: number;
  readonly score: number;
  readonly hp: number;
}

export interface ModePolicy {
  readonly id: ModeId;
  onRunStart(): void;
  onTick(deltaMs: number, ctx: ModeContext): void;
  isRunOver(ctx: ModeContext): boolean;
  onMiss(ctx: ModeContext): PenaltyKind;
  onBombClick(ctx: ModeContext): PenaltyKind;
}
