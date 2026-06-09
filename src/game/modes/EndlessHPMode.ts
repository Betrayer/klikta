import type { ModeId } from "../../data/modes";
import type { ModeContext, ModePolicy, PenaltyKind } from "./ModePolicy";

export class EndlessHPMode implements ModePolicy {
  readonly id: ModeId = "endless_hp";
  readonly initialTimeMs = 0;
  readonly usesMetaPerks = true;

  onRunStart(): void {}

  onTick(): void {}

  isRunOver(ctx: ModeContext): boolean {
    return ctx.hp <= 0;
  }

  isVictory(): boolean {
    return false;
  }

  onHit(): void {}

  onMiss(): PenaltyKind {
    return "hp";
  }

  onBombClick(): PenaltyKind {
    return "hp";
  }

  resumeFromBreak(): void {}
}
