import type { ModeId } from "../../data/modes";
import type { ModeContext, ModePolicy, PenaltyKind } from "./ModePolicy";

export class CampaignMode implements ModePolicy {
  readonly id: ModeId = "campaign";

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
