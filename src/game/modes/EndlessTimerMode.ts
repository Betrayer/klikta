import type { ModeId } from "../../data/modes";
import type { ModePolicy, PenaltyKind } from "./ModePolicy";

export class EndlessTimerMode implements ModePolicy {
  readonly id: ModeId = "endless_timer";

  onRunStart(): void {}

  onTick(): void {}

  isRunOver(): boolean {
    return false;
  }

  onMiss(): PenaltyKind {
    return "none";
  }

  onBombClick(): PenaltyKind {
    return "none";
  }
}
