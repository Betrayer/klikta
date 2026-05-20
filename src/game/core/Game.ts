import {
  Application,
  Container,
  Graphics,
  type FederatedPointerEvent,
  type Ticker,
} from "pixi.js";
import type { Target } from "../entities/Target";
import { RegularTarget } from "../entities/RegularTarget";
import { GoldenTarget } from "../entities/GoldenTarget";
import { BombTarget } from "../entities/BombTarget";
import { MultiTarget } from "../entities/MultiTarget";
import { ShieldedTarget } from "../entities/ShieldedTarget";
import { SpawnSystem, type SpawnEvent } from "../systems/SpawnSystem";
import { VFXSystem } from "../systems/VFXSystem";
import { CameraSystem } from "../systems/CameraSystem";
import { audioSystem } from "../systems/AudioSystem";
import type { TargetKind } from "../../data/targetConfig";
import { tweenManager } from "../util/TweenManager";
import { FEEL } from "../config/feel";
import { useRunStore, COMBO_MILESTONES } from "../../state/runStore";
import {
  EffectResolver,
  type RunModifiers,
  type SpawnPolicy,
  type TargetSpawnModifiers,
} from "../effects/EffectResolver";
import { getActiveResolver } from "../effects/activeResolver";

const TIME_PULSE_SPEEDS = [0.6, 1.6] as const;

export class Game {
  private readonly parent: HTMLElement;
  private app: Application | null = null;
  private targetLayer: Container | null = null;
  private readonly targets: Target[] = [];
  private spawnSystem: SpawnSystem | null = null;
  private unsubPause: (() => void) | null = null;
  private vfx: VFXSystem | null = null;
  private camera: CameraSystem | null = null;
  private flashGfx: Graphics | null = null;
  private hitFrameUntil = 0;
  private flashStartMs = -1;
  private clockMs = 0;
  private destroyed = false;

  private resolver: EffectResolver = EffectResolver.empty();
  private runMods: RunModifiers;
  private spawnPolicy: SpawnPolicy;
  private targetMods: TargetSpawnModifiers;

  private cursorX = 0;
  private cursorY = 0;
  private missesThisRun = 0;
  private bombClicksThisRun = 0;
  private scoreAtLastRegen = 0;
  private lastDamageMs = -Infinity;
  private baseTickerSpeed = 1;
  private timePulseNextStartMs = Infinity;
  private timePulseEndMs = 0;

  constructor(parent: HTMLElement) {
    this.parent = parent;
    const empty = EffectResolver.empty();
    this.runMods = empty.buildRunModifiers();
    this.spawnPolicy = empty.buildSpawnPolicy();
    this.targetMods = empty.buildBaseTargetModifiers();
  }

  async start(): Promise<void> {
    this.resolver = getActiveResolver();
    this.runMods = this.resolver.buildRunModifiers();
    this.spawnPolicy = this.resolver.buildSpawnPolicy();
    this.targetMods = this.resolver.buildBaseTargetModifiers();

    const app = new Application();
    await app.init({
      resizeTo: this.parent,
      background: "#1a0033",
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });

    if (this.destroyed) {
      app.destroy(true, { children: true });
      return;
    }

    this.app = app;
    this.parent.appendChild(app.canvas);

    const targetLayer = new Container();
    this.targetLayer = targetLayer;
    app.stage.addChild(targetLayer);

    const particleLayer = new Container();
    app.stage.addChild(particleLayer);
    this.vfx = new VFXSystem(particleLayer);

    this.camera = new CameraSystem(app.stage);

    const flash = new Graphics();
    flash.eventMode = "none";
    flash.alpha = 0;
    app.stage.addChild(flash);
    this.flashGfx = flash;
    this.drawFlash();
    app.renderer.on("resize", this.handleResize);

    app.stage.eventMode = "static";
    app.stage.hitArea = app.screen;
    app.stage.on("pointerdown", this.handleStagePointerDown);
    app.stage.on("pointermove", this.handleStagePointerMove);

    tweenManager.clear();
    const screen = app.renderer.screen;
    this.cursorX = screen.width / 2;
    this.cursorY = screen.height / 2;
    this.spawnSystem = new SpawnSystem(
      this.clockMs,
      this.spawnPolicy,
      this.targetMods,
      this.resolver.goldenLifetimeMul(),
      this.runMods.multiClicksOverride,
    );
    if (this.spawnPolicy.timePulse !== null) {
      this.timePulseNextStartMs =
        this.clockMs + this.spawnPolicy.timePulse.periodMs;
    }
    audioSystem.startMusic();
    this.syncMusicToCombo();
    app.ticker.add(this.tick);

    this.unsubPause = useRunStore.subscribe((state, prev) => {
      if (state.paused !== prev.paused) this.applyPaused(state.paused);
    });
  }

  private applyPaused(paused: boolean): void {
    if (this.app === null) return;
    if (paused) this.app.ticker.stop();
    else this.app.ticker.start();
    audioSystem.setPaused(paused);
  }

  private handleStagePointerMove = (event: FederatedPointerEvent): void => {
    this.cursorX = event.global.x;
    this.cursorY = event.global.y;
  };

  private handleStagePointerDown = (event: FederatedPointerEvent): void => {
    if (useRunStore.getState().paused) return;
    if (this.app === null || event.target !== this.app.stage) return;

    if (this.runMods.shieldedShieldBreaksOnMiss) {
      const broken = this.tryBreakNearestShield(event.global.x, event.global.y);
      if (broken) {
        audioSystem.playSFX("hit_shielded_break");
        return;
      }
    }

    audioSystem.playSFX("miss");

    if (this.runMods.backgroundClickIgnored) {
      return;
    }

    const skipHpLoss =
      this.runMods.shieldedMissNoHPLoss && this.hasActiveShield();
    useRunStore.getState().resetCombo();
    if (!skipHpLoss) this.applyDamage(1);
    this.syncMusicToCombo();
  };

  private tryBreakNearestShield(x: number, y: number): boolean {
    let best: ShieldedTarget | null = null;
    let bestDist = Infinity;
    for (const t of this.targets) {
      if (!(t instanceof ShieldedTarget)) continue;
      if (!t.hasShield || !t.isInteractive) continue;
      const dx = t.x - x;
      const dy = t.y - y;
      const d = Math.hypot(dx, dy);
      if (d < bestDist) {
        bestDist = d;
        best = t;
      }
    }
    if (best === null) return false;
    return best.breakShield();
  }

  private hasActiveShield(): boolean {
    for (const t of this.targets) {
      if (t instanceof ShieldedTarget && t.hasShield && t.isInteractive) {
        return true;
      }
    }
    return false;
  }

  private handleResize = (): void => {
    this.drawFlash();
  };

  private drawFlash(): void {
    if (this.app === null || this.flashGfx === null) return;
    const { width, height } = this.app.renderer.screen;
    this.flashGfx
      .clear()
      .rect(-40, -40, width + 80, height + 80)
      .fill(0xffffff);
  }

  private triggerJuice(target: Target): void {
    if (this.app === null) return;
    if (useRunStore.getState().status !== "playing") return;

    if (target.kind === "bomb") {
      this.camera?.shake(FEEL.shake.bombIntensity, FEEL.shake.bombMs);
    } else if (target.kind === "golden") {
      this.camera?.shake(FEEL.shake.goldenIntensity, FEEL.shake.goldenMs);
    }
    this.triggerHitFrame();
  }

  private triggerHitFrame(): void {
    if (this.app === null) return;
    this.hitFrameUntil = performance.now() + FEEL.hitFrameMs;
    this.flashStartMs = performance.now();
    this.updateTickerSpeed();
  }

  private updateHitFrame(): void {
    if (this.app === null) return;
    const now = performance.now();
    if (this.hitFrameUntil > 0 && now >= this.hitFrameUntil) {
      this.hitFrameUntil = 0;
      this.updateTickerSpeed();
    }
    if (this.flashGfx === null || this.flashStartMs < 0) return;
    const elapsed = now - this.flashStartMs;
    const inMs = FEEL.flashInMs;
    const outMs = FEEL.flashOutMs;
    if (elapsed <= inMs) {
      this.flashGfx.alpha = FEEL.flashAlpha * (elapsed / inMs);
    } else if (elapsed <= inMs + outMs) {
      this.flashGfx.alpha = FEEL.flashAlpha * (1 - (elapsed - inMs) / outMs);
    } else {
      this.flashGfx.alpha = 0;
      this.flashStartMs = -1;
    }
  }

  private updateTimePulse(): void {
    const pulse = this.spawnPolicy.timePulse;
    if (pulse === null) return;

    if (this.timePulseEndMs > 0 && this.clockMs >= this.timePulseEndMs) {
      this.timePulseEndMs = 0;
      this.baseTickerSpeed = 1;
      this.updateTickerSpeed();
    }

    if (
      this.timePulseEndMs === 0 &&
      this.clockMs >= this.timePulseNextStartMs
    ) {
      const speed = TIME_PULSE_SPEEDS[
        Math.floor(Math.random() * TIME_PULSE_SPEEDS.length)
      ];
      this.baseTickerSpeed = speed ?? 1;
      this.timePulseEndMs = this.clockMs + pulse.durationMs;
      this.timePulseNextStartMs = this.clockMs + pulse.periodMs;
      this.updateTickerSpeed();
    }
  }

  private updateTickerSpeed(): void {
    if (this.app === null) return;
    const inHitFrame =
      this.hitFrameUntil > 0 && performance.now() < this.hitFrameUntil;
    const speed = inHitFrame
      ? this.baseTickerSpeed * FEEL.hitFrameSlow
      : this.baseTickerSpeed;
    this.app.ticker.speed = speed;
  }

  private tick = (ticker: Ticker): void => {
    if (
      this.app === null ||
      this.targetLayer === null ||
      this.spawnSystem === null
    ) {
      return;
    }

    const deltaMs = ticker.deltaMS;
    this.clockMs += deltaMs;
    tweenManager.update(deltaMs);
    this.vfx?.update(deltaMs);
    this.camera?.update(deltaMs);
    this.updateHitFrame();
    this.updateTimePulse();
    this.applyHpRegen();

    const { width, height } = this.app.renderer.screen;
    const ctx = {
      cursorX: this.cursorX,
      cursorY: this.cursorY,
      centerX: width / 2,
      centerY: height / 2,
    };

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      if (target === undefined) continue;
      target.update(deltaMs, ctx);
      if (target.isDead) {
        const pair = target.pairTarget;
        if (pair !== null && !pair.isDead) {
          pair.pairTarget = null;
          target.pairTarget = null;
          pair.beginPairKill();
        }
        if (target.expiredUnclicked && target.kind !== "bomb") {
          this.handleMissExpiry();
        }
        this.removeTargetAt(i);
      }
    }

    const events = this.spawnSystem.tick(this.clockMs, { width, height });
    if (events.length > 0) this.spawnEvents(events);
  };

  private handleMissExpiry(): void {
    if (
      this.runMods.firstMissForgiven &&
      this.missesThisRun === 0
    ) {
      this.missesThisRun = 1;
      return;
    }
    this.missesThisRun += 1;
    useRunStore.getState().resetCombo();
    this.syncMusicToCombo();
  }

  private applyHpRegen(): void {
    if (this.runMods.hpRegenPer1000Score <= 0) return;
    const score = useRunStore.getState().score;
    const earned = score - this.scoreAtLastRegen;
    if (earned < 1000) return;
    const steps = Math.floor(earned / 1000);
    this.scoreAtLastRegen += steps * 1000;
    useRunStore.getState().healHP(steps * this.runMods.hpRegenPer1000Score);
  }

  private applyDamage(amount: number): void {
    if (amount <= 0) return;
    const iframes = this.runMods.damageIframesMs;
    if (iframes > 0 && this.clockMs - this.lastDamageMs < iframes) return;
    this.lastDamageMs = this.clockMs;
    const store = useRunStore.getState();
    store.loseHPBy(amount);
    if (useRunStore.getState().status === "gameOver") {
      audioSystem.playSFX("game_over");
      audioSystem.musicGameOver();
    }
  }

  private createTarget(event: SpawnEvent): Target {
    const spawn = { x: event.x, y: event.y };
    switch (event.kind) {
      case "regular":
        return new RegularTarget(spawn, event.modifiers);
      case "golden":
        return new GoldenTarget(spawn, event.modifiers);
      case "bomb":
        return new BombTarget(spawn, event.modifiers, event.appearAsGolden);
      case "multi":
        return new MultiTarget(spawn, event.modifiers, event.multiClicksOverride);
      case "shielded":
        return new ShieldedTarget(spawn, event.modifiers);
    }
  }

  private spawnEvents(events: SpawnEvent[]): void {
    if (this.targetLayer === null) return;
    const spawned: Target[] = [];
    for (const event of events) {
      const target = this.createTarget(event);
      target.graphics.on("pointerdown", () => this.handleTargetClick(target));
      this.targetLayer.addChild(target.graphics);
      this.targets.push(target);
      spawned.push(target);
    }
    if (
      this.spawnPolicy.mirrorSpawn &&
      spawned.length === 2 &&
      events[0]?.pairWithNext === true
    ) {
      const [a, b] = spawned;
      if (a !== undefined && b !== undefined) {
        a.pairTarget = b;
        b.pairTarget = a;
      }
    }
  }

  private handleTargetClick(target: Target): void {
    if (useRunStore.getState().paused) return;
    if (!target.isInteractive) return;

    const wasPhaseInvisible = target.isPhaseInvisible;
    const result = target.onClick();

    if (result.effects.includes("lose_hp")) {
      audioSystem.playSFX("bomb_click");
      this.handleBombClick();
    }

    if (result.destroyed) {
      if (target.kind !== "bomb") {
        if (result.score > 0) {
          let scaled = result.score * this.runMods.scoreMul;
          const pf = target.modifiers.phaseFlash;
          if (wasPhaseInvisible && pf !== null) {
            scaled *= pf.bonusMul;
          }
          useRunStore.getState().registerHit(Math.round(scaled));
        }
        this.syncMusicToCombo();
        audioSystem.playSFX(this.hitSfx(target.kind));
        this.handleComboMilestone();
      }
      this.emitHitVfx(target);
      this.triggerJuice(target);
      target.beginHitExit();
      this.killPair(target);
    } else if (target.kind === "multi") {
      audioSystem.playSFX("hit_multi_partial");
      this.vfx?.emitSubHit(target.x, target.y, target.color);
    } else if (target.kind === "shielded") {
      audioSystem.playSFX("hit_shielded_break");
    }
  }

  private killPair(target: Target): void {
    const pair = target.pairTarget;
    if (pair === null) return;
    target.pairTarget = null;
    pair.pairTarget = null;
    pair.beginPairKill();
  }

  private handleBombClick(): void {
    this.bombClicksThisRun += 1;
    const free =
      this.runMods.bombClickFreeAfterFirst && this.bombClicksThisRun > 1;
    if (!free) this.applyDamage(this.runMods.bombClickHPMul);
    if (!this.runMods.comboNoResetOnBombClick) {
      useRunStore.getState().resetCombo();
      this.syncMusicToCombo();
    }
  }

  private hitSfx(kind: TargetKind): string {
    if (kind === "golden") return "hit_golden";
    if (kind === "multi") return "hit_multi_complete";
    return "hit_regular";
  }

  private syncMusicToCombo(): void {
    const combo = useRunStore.getState().combo;
    audioSystem.setMusicIntensity(Math.min(combo / 50, 1));
  }

  private handleComboMilestone(): void {
    if (this.app === null) return;
    const combo = useRunStore.getState().combo;
    if (!COMBO_MILESTONES.includes(combo)) return;
    audioSystem.playSFX("combo_milestone");
    audioSystem.musicSwell();
    this.camera?.shake(FEEL.shake.comboIntensity, FEEL.shake.comboMs);
    const { width, height } = this.app.renderer.screen;
    this.vfx?.emitMilestone(width / 2, height / 2);
  }

  private emitHitVfx(target: Target): void {
    if (this.vfx === null) return;
    if (target.kind === "bomb") {
      this.vfx.emitBombExplosion(target.x, target.y);
    } else if (target.kind === "golden") {
      this.vfx.emitGoldenHit(target.x, target.y);
    } else {
      this.vfx.emitHit(target.x, target.y, target.color);
    }
  }

  private removeTargetAt(index: number): void {
    const target = this.targets[index];
    if (target === undefined) return;
    this.targets.splice(index, 1);
    target.destroy();
  }

  get fps(): number {
    return this.app?.ticker.FPS ?? 0;
  }

  stop(): void {
    this.app?.ticker.stop();
  }

  destroy(): void {
    this.destroyed = true;
    if (this.app === null) return;
    this.app.ticker.remove(this.tick);
    this.app.ticker.speed = 1;
    this.unsubPause?.();
    this.unsubPause = null;
    audioSystem.setPaused(false);
    this.app.renderer.off("resize", this.handleResize);
    this.app.stage.off("pointerdown", this.handleStagePointerDown);
    this.app.stage.off("pointermove", this.handleStagePointerMove);
    tweenManager.clear();
    this.vfx?.clear();
    this.camera?.reset();
    for (const target of this.targets) target.destroy();
    this.targets.length = 0;
    this.app.destroy(true, { children: true });
    this.app = null;
    this.targetLayer = null;
    this.spawnSystem = null;
    this.vfx = null;
    this.camera = null;
    this.flashGfx = null;
    this.flashStartMs = -1;
  }
}
