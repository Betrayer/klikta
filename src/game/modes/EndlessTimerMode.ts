import type { ModeId } from "../../data/modes";
import type { TargetKind } from "../../data/targetConfig";
import { useRunStore } from "../../state/runStore";
import {
  TIMER_BOMB_PENALTY_MS,
  TIMER_GAIN_BY_KIND,
  TIMER_INITIAL_MS,
} from "../config/balance";
import type { ModeContext, ModePolicy, PenaltyKind } from "./ModePolicy";

export class EndlessTimerMode implements ModePolicy {
  readonly id: ModeId = "endless_timer";
  readonly initialTimeMs = TIMER_INITIAL_MS;

  onRunStart(): void {}

  onTick(deltaMs: number): void {
    useRunStore.getState().adjustTimeRemaining(-deltaMs);
  }

  isRunOver(ctx: ModeContext): boolean {
    return ctx.timeRemainingMs <= 0;
  }

  onHit(_ctx: ModeContext, kind: TargetKind): void {
    const gain = TIMER_GAIN_BY_KIND[kind];
    if (gain > 0) useRunStore.getState().adjustTimeRemaining(gain);
  }

  onMiss(): PenaltyKind {
    return "none";
  }

  onBombClick(): PenaltyKind {
    useRunStore.getState().adjustTimeRemaining(-TIMER_BOMB_PENALTY_MS);
    return "none";
  }
}
