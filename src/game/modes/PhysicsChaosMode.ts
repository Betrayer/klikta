import type { ModeId } from "../../data/modes";
import type { ModeContext, ModePolicy, PenaltyKind } from "./ModePolicy";

export class PhysicsChaosMode implements ModePolicy {
  readonly id: ModeId = "physics_chaos";
  readonly initialTimeMs = 0;

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
