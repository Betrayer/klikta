import type { ModeId } from "../../data/modes";
import type { ModeContext, ModePolicy, PenaltyKind } from "./ModePolicy";

export class EndlessHPMode implements ModePolicy {
  readonly id: ModeId = "endless_hp";

  onRunStart(): void {}

  onTick(): void {}

  isRunOver(ctx: ModeContext): boolean {
    return ctx.hp <= 0;
  }

  onMiss(): PenaltyKind {
    return "hp";
  }

  onBombClick(): PenaltyKind {
    return "hp";
  }
}
