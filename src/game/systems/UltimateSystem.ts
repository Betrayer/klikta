import { useRunStore } from "../../state/runStore";
import type { GameContext, UltimateImpl } from "../ultimates/types";
import { MAX_CHARGE } from "../config/balance";

export class UltimateSystem {
  private readonly chargeMap = new Map<string, number>();
  private activeId: string | null = null;
  private activeStartMs = 0;
  private activeEndsAtMs = 0;
  private unlocked: string[];
  private readonly registry: Map<string, UltimateImpl>;

  constructor(
    unlockedIds: readonly string[],
    registry: Map<string, UltimateImpl>,
  ) {
    this.unlocked = unlockedIds.filter((id) => registry.has(id));
    this.registry = registry;
    for (const id of this.unlocked) this.chargeMap.set(id, 0);
    this.pushChargesToStore();
    useRunStore.getState().setActiveUltimate(null);
  }

  get unlockedIds(): readonly string[] {
    return this.unlocked;
  }

  unlock(id: string): void {
    if (!this.registry.has(id) || this.unlocked.includes(id)) return;
    this.unlocked = [...this.unlocked, id];
    this.chargeMap.set(id, 0);
    this.pushChargesToStore();
  }

  get isActive(): boolean {
    return this.activeId !== null;
  }

  get activeUltimateId(): string | null {
    return this.activeId;
  }

  isUnlocked(id: string): boolean {
    return this.unlocked.includes(id);
  }

  chargeOf(id: string): number {
    return this.chargeMap.get(id) ?? 0;
  }

  addCharge(amount: number): void {
    if (this.unlocked.length === 0 || amount <= 0) return;
    let changed = false;
    for (const id of this.unlocked) {
      const current = this.chargeMap.get(id) ?? 0;
      const next = Math.min(MAX_CHARGE, current + amount);
      if (next !== current) {
        this.chargeMap.set(id, next);
        changed = true;
      }
    }
    if (changed) this.pushChargesToStore();
  }

  canActivate(id: string): boolean {
    if (!this.unlocked.includes(id)) return false;
    if ((this.chargeMap.get(id) ?? 0) < MAX_CHARGE) return false;
    const impl = this.registry.get(id);
    if (impl === undefined) return false;
    if (this.activeId !== null && impl.blocksOthers) return false;
    if (this.activeId !== null) {
      const activeImpl = this.registry.get(this.activeId);
      if (activeImpl !== undefined && activeImpl.blocksOthers) return false;
    }
    return true;
  }

  activate(id: string, currentTimeMs: number, ctx: GameContext): boolean {
    if (!this.canActivate(id)) return false;
    const impl = this.registry.get(id);
    if (impl === undefined) return false;

    this.chargeMap.set(id, 0);
    this.pushChargesToStore();

    if (!impl.blocksOthers) {
      impl.apply(ctx);
      impl.cleanup(ctx);
      return true;
    }

    this.activeId = id;
    this.activeStartMs = currentTimeMs;
    this.activeEndsAtMs = currentTimeMs + impl.durationMs;
    useRunStore.getState().setActiveUltimate(id);
    impl.apply(ctx);
    return true;
  }

  update(currentTimeMs: number, ctx: GameContext): void {
    if (this.activeId === null) return;
    const impl = this.registry.get(this.activeId);
    if (impl?.update !== undefined) {
      impl.update(ctx, currentTimeMs - this.activeStartMs);
    }
    if (currentTimeMs >= this.activeEndsAtMs) {
      impl?.cleanup(ctx);
      this.activeId = null;
      this.activeStartMs = 0;
      this.activeEndsAtMs = 0;
      useRunStore.getState().setActiveUltimate(null);
    }
  }

  forceCleanup(ctx: GameContext): void {
    if (this.activeId === null) return;
    const impl = this.registry.get(this.activeId);
    impl?.cleanup(ctx);
    this.activeId = null;
    this.activeStartMs = 0;
    this.activeEndsAtMs = 0;
  }

  private pushChargesToStore(): void {
    const out: Record<string, number> = {};
    for (const [id, value] of this.chargeMap) out[id] = value;
    useRunStore.getState().setUltimateCharges(out);
  }
}
