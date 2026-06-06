import {
  Application,
  Container,
  type FederatedPointerEvent,
  type Ticker,
} from "pixi.js";
import type { Target } from "../entities/Target";
import { PhantomTarget } from "../entities/PhantomTarget";
import { RegularTarget } from "../entities/RegularTarget";
import { GoldenTarget } from "../entities/GoldenTarget";
import { BombTarget } from "../entities/BombTarget";
import { MultiTarget } from "../entities/MultiTarget";
import { ShieldedTarget } from "../entities/ShieldedTarget";
import { SplitterTarget } from "../entities/SplitterTarget";
import { StickyTarget } from "../entities/StickyTarget";
import {
  SpawnSystem,
  PHYSICS_KIND_POOL,
  type SpawnEvent,
} from "../systems/SpawnSystem";
import type { PhysicsEngine } from "../systems/PhysicsEngine";
import { VFXSystem } from "../systems/VFXSystem";
import { CameraSystem } from "../systems/CameraSystem";
import { audioSystem } from "../systems/AudioSystem";
import { haptic } from "../../services/telegram";
import {
  areThemeAssetsLoaded,
  loadThemeAssets,
} from "../assets/loadThemeAssets";
import { BackgroundLayer } from "../background/BackgroundLayer";
import { getActiveTheme, getBackgroundSpec } from "../../state/themeSelectors";
import { useSettingsStore } from "../../state/settingsStore";
import { FpsMonitor, reduceBackgroundSpec } from "../util/performance";
import type { BackgroundSpec } from "../../data/themes/types";
import { UltimateSystem } from "../systems/UltimateSystem";
import {
  setUltimateActivationHandler,
  clearUltimateActivationHandler,
} from "../systems/ultimateActivation";
import { createUltimateRegistry } from "../ultimates/registry";
import type { GameContext } from "../ultimates/types";
import { SKILL_TREE, findUltimateForBranch } from "../../data/skillTree";
import { TARGET_CONFIG, type TargetKind } from "../../data/targetConfig";
import { rollRunPerkChoices, type RunPerk } from "../../data/runPerks";
import type { SkillEffect } from "../effects/types";
import { tweenManager } from "../util/TweenManager";
import { FEEL } from "../config/feel";
import {
  ACHIEVEMENT_REWARDS,
  CHARGE_PER_COMBO_MILESTONE,
  CHARGE_PER_HIT,
  PHYSICS_BODY_CAP,
  PHYSICS_CLICK_RADIUS,
  PHYSICS_INTERVAL_SCALE,
  PHYSICS_MULTI_CLICKS,
  PHYSICS_SPEED_MIN,
  PHYSICS_SPEED_RANGE,
  SCORE_PER_CURRENCY,
  SPLITTER_FRAGMENT_COUNT,
  SPLITTER_FRAGMENT_LIFETIME_MS,
  SPLITTER_FRAGMENT_SCORE_MUL,
  SPLITTER_FRAGMENT_SIZE_MUL,
  SPLITTER_FRAGMENT_SPREAD_MIN,
  SPLITTER_FRAGMENT_SPREAD_RANGE,
  VICTORY_BONUS_CURRENCY,
  comboBonusForMax,
} from "../config/balance";
import {
  useRunStore,
  COMBO_MILESTONES,
  comboMultiplier,
  type CurrencyBreakdown,
  type AchievementAward,
} from "../../state/runStore";
import { useMetaStore } from "../../state/metaStore";
import {
  EffectResolver,
  type RunModifiers,
  type SpawnPolicy,
  type TargetSpawnModifiers,
} from "../effects/EffectResolver";
import { getActiveResolver } from "../effects/activeResolver";
import type {
  ModeContext,
  ModePolicy,
  ModeTickDirective,
} from "../modes/ModePolicy";
import { EndlessHPMode } from "../modes/EndlessHPMode";
import { getActiveModePolicy } from "../modes/activeModePolicy";
import {
  setRunPerkPickHandler,
  clearRunPerkPickHandler,
} from "../modes/runPerkPick";
import { useCampaignStore } from "../../state/campaignStore";

const TIME_PULSE_SPEEDS = [0.6, 1.6] as const;
const TIME_PULSE_WARNING_MS = 500;
const ULTIMATE_HOTKEYS: readonly string[] = [
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
];

export class Game {
  private readonly parent: HTMLElement;
  private app: Application | null = null;
  private targetLayer: Container | null = null;
  private phantomLayer: Container | null = null;
  private readonly targets: Target[] = [];
  private readonly phantoms: PhantomTarget[] = [];
  private spawnSystem: SpawnSystem | null = null;
  private unsubPause: (() => void) | null = null;
  private unsubTheme: (() => void) | null = null;
  private unsubReduceMotion: (() => void) | null = null;
  private readonly fpsMonitor = new FpsMonitor();
  private autoReduceMotion = false;
  private vfx: VFXSystem | null = null;
  private camera: CameraSystem | null = null;
  private background: BackgroundLayer | null = null;
  private hitFrameUntil = 0;
  private clockMs = 0;
  private destroyed = false;
  private mode: ModePolicy = new EndlessHPMode();
  private physics: PhysicsEngine | null = null;
  private runEnded = false;

  private resolver: EffectResolver = EffectResolver.empty();
  private runMods: RunModifiers;
  private spawnPolicy: SpawnPolicy;
  private targetMods: TargetSpawnModifiers;
  private readonly usedRunPerkIds: string[] = [];
  private waveBreakChoices: RunPerk[] = [];
  private readonly ultimateHandler = (id: string): void => {
    this.tryActivateUltimate(id);
  };
  private readonly runPerkHandler = (id: string): void => {
    this.onRunPerkChosen(id);
  };
  private ultimateSystem: UltimateSystem | null = null;
  private ultimateCtx: GameContext | null = null;
  private ultimateTimeScale = 1;
  private hpRegenDisabled = false;
  private readonly scoreMultiplier = { current: 1 };

  private readonly setUltimateTimeScale = (scale: number): void => {
    this.ultimateTimeScale = scale;
    this.updateTickerSpeed();
  };

  private readonly ultimateShake = (
    intensity: number,
    durationMs: number,
  ): void => {
    this.camera?.shake(intensity, durationMs);
  };

  private readonly disableHpRegenForRun = (): void => {
    this.hpRegenDisabled = true;
  };

  private cursorX = 0;
  private cursorY = 0;
  private missesThisRun = 0;
  private bombBountyEarned = 0;
  private comboCoinEarned = 0;
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

  async start(onAssetsLoading?: (loading: boolean) => void): Promise<void> {
    this.resolver = getActiveResolver();
    this.runMods = this.resolver.buildRunModifiers();
    this.spawnPolicy = this.resolver.buildSpawnPolicy();
    this.targetMods = this.resolver.buildBaseTargetModifiers();
    this.bombBountyEarned = 0;
    this.comboCoinEarned = 0;
    this.missesThisRun = 0;
    this.scoreAtLastRegen = 0;
    this.lastDamageMs = -Infinity;
    this.scoreMultiplier.current = 1;
    this.ultimateTimeScale = 1;
    this.hpRegenDisabled = false;
    this.runEnded = false;
    this.physics = null;
    this.usedRunPerkIds.length = 0;
    this.waveBreakChoices = [];
    this.mode = getActiveModePolicy();

    const unlockedFromPerks = this.resolver.getUltimateUnlocks();
    this.ultimateSystem = new UltimateSystem(
      unlockedFromPerks,
      createUltimateRegistry(),
    );
    setUltimateActivationHandler(this.ultimateHandler);
    setRunPerkPickHandler(this.runPerkHandler);

    const themeId = useMetaStore.getState().activeThemeId;
    const needsLoad =
      !areThemeAssetsLoaded(themeId) || !audioSystem.arePacksLoaded();
    if (needsLoad) {
      onAssetsLoading?.(true);
      await loadThemeAssets(themeId);
      await audioSystem.loadActivePacks();
      onAssetsLoading?.(false);
      if (this.destroyed) return;
    }

    const app = new Application();
    await app.init({
      resizeTo: this.parent,
      background: getActiveTheme().background.color ?? 0x1a0033,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      preference: "webgl",
    });

    if (this.destroyed) {
      app.destroy(true, { children: true });
      return;
    }

    this.app = app;
    this.parent.appendChild(app.canvas);

    this.autoReduceMotion = false;
    this.fpsMonitor.reset();
    const background = new BackgroundLayer(this.currentBackgroundSpec(), {
      w: app.renderer.screen.width,
      h: app.renderer.screen.height,
    });
    this.background = background;
    app.stage.addChild(background.view);

    const phantomLayer = new Container();
    this.phantomLayer = phantomLayer;
    app.stage.addChild(phantomLayer);

    const targetLayer = new Container();
    this.targetLayer = targetLayer;
    app.stage.addChild(targetLayer);

    const overlayLayer = new Container();
    overlayLayer.eventMode = "none";
    app.stage.addChild(overlayLayer);

    const particleLayer = new Container();
    app.stage.addChild(particleLayer);
    this.vfx = new VFXSystem(particleLayer);

    this.camera = new CameraSystem(app.stage);

    app.renderer.on("resize", this.handleResize);

    app.stage.eventMode = "static";
    app.stage.hitArea = app.screen;
    app.stage.on("pointerdown", this.handleStagePointerDown);
    app.stage.on("pointermove", this.handleStagePointerMove);

    tweenManager.clear();
    const screen = app.renderer.screen;
    this.cursorX = screen.width / 2;
    this.cursorY = screen.height / 2;
    const multiClicks =
      this.mode.id === "physics_chaos"
        ? (this.runMods.multiClicksOverride ?? PHYSICS_MULTI_CLICKS)
        : this.runMods.multiClicksOverride;
    this.spawnSystem = new SpawnSystem(
      this.clockMs,
      this.spawnPolicy,
      this.targetMods,
      this.resolver.goldenLifetimeMul(),
      multiClicks,
    );
    if (this.mode.id === "campaign") {
      this.spawnSystem.setWaveDriven(true);
    }
    if (this.mode.id === "physics_chaos") {
      const { PhysicsEngine } = await import("../systems/PhysicsEngine");
      if (this.destroyed || this.app === null) return;
      const physics = new PhysicsEngine();
      physics.init({ width: screen.width, height: screen.height });
      this.physics = physics;
      this.spawnSystem.setKindPool(PHYSICS_KIND_POOL);
      this.spawnSystem.setIntervalScale(PHYSICS_INTERVAL_SCALE);
    }
    if (this.spawnPolicy.timePulse !== null) {
      this.timePulseNextStartMs =
        this.clockMs + this.spawnPolicy.timePulse.periodMs;
    }
    this.ultimateCtx = {
      app,
      overlay: overlayLayer,
      spawnSystem: this.spawnSystem,
      targets: this.targets,
      vfx: this.vfx,
      audio: audioSystem,
      scoreMultiplier: this.scoreMultiplier,
      setTimeScale: this.setUltimateTimeScale,
      shake: this.ultimateShake,
      disableHpRegen: this.disableHpRegenForRun,
    };
    audioSystem.startMusic();
    this.syncMusicToCombo();
    this.mode.onRunStart();
    app.ticker.add(this.tick);

    window.addEventListener("keydown", this.handleKeydown);

    this.unsubPause = useRunStore.subscribe((state, prev) => {
      if (state.paused !== prev.paused) this.applyPaused(state.paused);
    });

    this.unsubTheme = useMetaStore.subscribe((state, prev) => {
      if (state.activeThemeId !== prev.activeThemeId) {
        this.refreshBackground();
      }
    });

    this.unsubReduceMotion = useSettingsStore.subscribe((state, prev) => {
      if (state.reduceMotion !== prev.reduceMotion) {
        this.refreshBackground();
      }
    });
  }

  private buildUltimateContext(): GameContext | null {
    return this.ultimateCtx;
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.repeat) return;
    const idx = ULTIMATE_HOTKEYS.indexOf(event.code);
    if (idx < 0) return;
    const branch = SKILL_TREE[idx];
    if (branch === undefined) return;
    const ult = findUltimateForBranch(branch.id);
    if (ult === undefined) return;
    event.preventDefault();
    this.tryActivateUltimate(ult.id);
  };

  private tryActivateUltimate(id: string): void {
    if (this.ultimateSystem === null) return;
    const run = useRunStore.getState();
    if (run.status !== "playing" || run.paused) return;
    if (!this.ultimateSystem.canActivate(id)) return;
    const ctx = this.buildUltimateContext();
    if (ctx === null) return;
    this.ultimateSystem.activate(id, this.clockMs, ctx);
    haptic("ultimate");
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

    if (this.physics !== null) {
      this.physics.applyClickImpulse(
        event.global.x,
        event.global.y,
        PHYSICS_CLICK_RADIUS,
      );
    }

    if (this.runMods.shieldedShieldBreaksOnMiss) {
      const broken = this.tryBreakNearestShield(event.global.x, event.global.y);
      if (broken) {
        audioSystem.playSFX("hit_shielded_break");
        return;
      }
    }

    audioSystem.playSFX("miss");

    const skipHpLoss =
      this.runMods.shieldedMissNoHPLoss && this.hasActiveShield();
    if (!this.runMods.backgroundClickIgnored) {
      useRunStore.getState().resetCombo();
    }
    if (!skipHpLoss) this.applyMissPenalty();
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
    if (this.app === null) return;
    const { width, height } = this.app.renderer.screen;
    this.background?.resize(width, height);
    if (this.physics !== null) {
      this.physics.resize({ width, height });
    }
  };

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
    this.updateTickerSpeed();
  }

  private updateHitFrame(): void {
    if (this.app === null) return;
    const now = performance.now();
    if (this.hitFrameUntil > 0 && now >= this.hitFrameUntil) {
      this.hitFrameUntil = 0;
      this.updateTickerSpeed();
    }
  }

  private updateTimePulse(): void {
    const pulse = this.spawnPolicy.timePulse;
    if (pulse === null) return;
    const store = useRunStore.getState();

    if (this.timePulseEndMs > 0 && this.clockMs >= this.timePulseEndMs) {
      this.timePulseEndMs = 0;
      this.baseTickerSpeed = 1;
      this.updateTickerSpeed();
    }

    if (
      this.timePulseEndMs === 0 &&
      this.clockMs >= this.timePulseNextStartMs
    ) {
      const speed =
        TIME_PULSE_SPEEDS[Math.floor(Math.random() * TIME_PULSE_SPEEDS.length)];
      this.baseTickerSpeed = speed ?? 1;
      this.timePulseEndMs = this.clockMs + pulse.durationMs;
      this.timePulseNextStartMs = this.clockMs + pulse.periodMs;
      this.updateTickerSpeed();
      if (store.timePulseIncoming) store.setTimePulseIncoming(false);
      return;
    }

    const inWarningWindow =
      this.timePulseEndMs === 0 &&
      this.timePulseNextStartMs - this.clockMs <= TIME_PULSE_WARNING_MS;
    if (inWarningWindow !== store.timePulseIncoming) {
      store.setTimePulseIncoming(inWarningWindow);
    }
  }

  private updateTickerSpeed(): void {
    if (this.app === null) return;
    const inHitFrame =
      this.hitFrameUntil > 0 && performance.now() < this.hitFrameUntil;
    const base = inHitFrame
      ? this.baseTickerSpeed * FEEL.hitFrameSlow
      : this.baseTickerSpeed;
    this.app.ticker.speed = base * this.ultimateTimeScale;
  }

  private reduceMotionActive(): boolean {
    return this.autoReduceMotion || useSettingsStore.getState().reduceMotion;
  }

  private currentBackgroundSpec(): BackgroundSpec {
    const spec = getBackgroundSpec();
    return this.reduceMotionActive() ? reduceBackgroundSpec(spec) : spec;
  }

  private refreshBackground(): void {
    this.background?.applySpec(this.currentBackgroundSpec());
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
    useRunStore.getState().tickElapsed(deltaMs);
    tweenManager.update(deltaMs);
    this.background?.update(deltaMs);
    if (!this.reduceMotionActive() && this.fpsMonitor.sample(deltaMs)) {
      this.autoReduceMotion = true;
      this.refreshBackground();
    }
    this.vfx?.update(deltaMs);
    this.camera?.update(deltaMs);
    this.updateHitFrame();
    this.updateTimePulse();
    this.applyHpRegen();
    const directive = this.mode.onTick(deltaMs, this.buildModeContext());
    if (directive) this.applyModeDirective(directive);
    if (this.ultimateSystem !== null) {
      const ctx = this.buildUltimateContext();
      if (ctx !== null) this.ultimateSystem.update(this.clockMs, ctx);
    }

    if (this.physics !== null) {
      this.physics.update(deltaMs);
      this.processStickyMerges();
      this.physics.syncToTargets(this.targets);
    }

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
        if (target.expiredUnclicked) {
          if (target.kind === "bomb") {
            this.tryAwardBombBounty();
          } else {
            this.handleMissExpiry();
          }
        }
        this.removeTargetAt(i);
      }
    }

    for (let i = this.phantoms.length - 1; i >= 0; i--) {
      const phantom = this.phantoms[i];
      if (phantom === undefined) continue;
      phantom.update(deltaMs);
      if (phantom.isDead) {
        this.phantoms.splice(i, 1);
        phantom.destroy();
      }
    }

    const events = this.spawnSystem.tick(this.clockMs, { width, height });
    if (events.length > 0) this.spawnEvents(events);

    this.checkRunOver();
  };

  private handleMissExpiry(): void {
    if (this.runMods.firstMissForgiven && this.missesThisRun === 0) {
      this.missesThisRun = 1;
      return;
    }
    this.missesThisRun += 1;
    useRunStore.getState().resetCombo();
    this.syncMusicToCombo();
  }

  private applyHpRegen(): void {
    if (this.hpRegenDisabled) return;
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
    useRunStore.getState().loseHPBy(amount);
    this.checkRunOver();
  }

  private applyMissPenalty(): void {
    switch (this.mode.onMiss(this.buildModeContext())) {
      case "hp":
        this.applyDamage(1);
        break;
      case "none":
        break;
    }
  }

  private applyBombPenalty(): void {
    switch (this.mode.onBombClick(this.buildModeContext())) {
      case "hp":
        this.applyDamage(1);
        break;
      case "none":
        break;
    }
  }

  private buildModeContext(): ModeContext {
    const run = useRunStore.getState();
    return {
      elapsedMs: this.clockMs,
      score: run.score,
      hp: run.hp,
      timeRemainingMs: run.timeRemainingMs,
      liveTargetCount: this.targets.length,
    };
  }

  private applyModeDirective(directive: ModeTickDirective): void {
    if (this.spawnSystem === null) return;
    if (directive.wavePlan !== undefined) {
      this.spawnSystem.setWavePlan(directive.wavePlan, this.clockMs);
    }
    if (directive.startWaveBreak !== undefined) {
      this.beginWaveBreak(directive.startWaveBreak.upcomingWave);
    }
  }

  private beginWaveBreak(upcomingWave: number): void {
    const choices = rollRunPerkChoices(this.usedRunPerkIds);
    this.waveBreakChoices = choices;
    useCampaignStore.getState().openBreak(
      upcomingWave,
      choices.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
      })),
    );
    audioSystem.playSFX("combo_milestone");
    this.setWaveFrozen(true);
  }

  private onRunPerkChosen(perkId: string): void {
    const perk = this.waveBreakChoices.find((p) => p.id === perkId);
    if (perk === undefined) return;
    this.usedRunPerkIds.push(perkId);
    this.applyRunEffects(perk.effects);
    this.waveBreakChoices = [];
    useCampaignStore.getState().closeBreak();
    this.mode.resumeFromBreak();
    this.setWaveFrozen(false);
  }

  private applyRunEffects(effects: readonly SkillEffect[]): void {
    const prevHPAdd = this.runMods.startingHPAdd;
    const prevComboCap = this.runMods.comboCap;
    this.resolver = this.resolver.extend(effects);
    this.runMods = this.resolver.buildRunModifiers();
    this.spawnPolicy = this.resolver.buildSpawnPolicy();
    this.targetMods = this.resolver.buildBaseTargetModifiers();
    this.spawnSystem?.reconfigure(
      this.spawnPolicy,
      this.targetMods,
      this.resolver.goldenLifetimeMul(),
      this.runMods.multiClicksOverride,
    );
    const hpDelta = this.runMods.startingHPAdd - prevHPAdd;
    if (hpDelta > 0) useRunStore.getState().addMaxHP(hpDelta);
    if (this.runMods.comboCap !== prevComboCap) {
      useRunStore.getState().setComboCap(this.runMods.comboCap);
    }
  }

  private setWaveFrozen(frozen: boolean): void {
    if (this.app === null) return;
    if (frozen) this.app.ticker.stop();
    else this.app.ticker.start();
  }

  private checkRunOver(): void {
    if (this.runEnded) return;
    if (!this.mode.isRunOver(this.buildModeContext())) return;
    this.endRun();
  }

  private endRun(): void {
    this.runEnded = true;
    const victory = this.mode.isVictory(this.buildModeContext());
    useRunStore.getState().endRun(victory);
    audioSystem.playSFX("game_over");
    haptic("gameOver");
    audioSystem.musicGameOver();
    this.awardRunRewards(victory);
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
        return new MultiTarget(
          spawn,
          event.modifiers,
          event.multiClicksOverride,
        );
      case "shielded":
        return new ShieldedTarget(spawn, event.modifiers);
      case "splitter":
        return new SplitterTarget(spawn, event.modifiers);
      case "sticky":
        return new StickyTarget(spawn, event.modifiers);
    }
  }

  private spawnEvents(events: SpawnEvent[]): void {
    if (this.targetLayer === null) return;
    if (this.physics !== null && this.targets.length >= PHYSICS_BODY_CAP)
      return;
    const spawned: Target[] = [];
    for (const event of events) {
      const target = this.createTarget(event);
      target.bindPointerDown(() => this.handleTargetClick(target));
      this.targetLayer.addChild(target.view);
      this.targets.push(target);
      spawned.push(target);
      if (this.physics !== null) this.bindToPhysics(target);
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

    if (this.physics !== null) {
      this.physics.applyClickImpulse(target.x, target.y, PHYSICS_CLICK_RADIUS);
    }

    if (result.effects.includes("lose_hp")) {
      audioSystem.playSFX("bomb_click");
      haptic("bomb");
      this.handleBombClick(target);
    }

    if (result.destroyed) {
      this.physics?.removeTarget(target.id);
      if (target.kind !== "bomb") {
        this.mode.onHit(this.buildModeContext(), target.kind);
        if (result.score > 0) {
          let scaled =
            result.score * this.runMods.scoreMul * this.scoreMultiplier.current;
          const pf = target.modifiers.phaseFlash;
          if (wasPhaseInvisible && pf !== null) {
            scaled *= pf.bonusMul;
          }
          const scoreBefore = useRunStore.getState().score;
          useRunStore.getState().registerHit(Math.round(scaled));
          this.tryAwardComboCoin();
          this.spawnEchoPhantom(
            target,
            useRunStore.getState().score - scoreBefore,
          );
        }
        this.ultimateSystem?.addCharge(CHARGE_PER_HIT[target.kind]);
        this.syncMusicToCombo();
        audioSystem.playSFX(this.hitSfx(target.kind));
        haptic(target.kind === "golden" ? "golden" : "hit");
        this.handleComboMilestone();
        this.spawnFrenzyBurst(target.x, target.y);
      }
      this.emitHitVfx(target);
      this.triggerJuice(target);
      if (target.kind === "splitter") {
        this.spawnSplitterFragments(target.x, target.y);
      }
      target.beginHitExit();
      this.killPair(target);
    } else if (target.kind === "multi" || target.kind === "sticky") {
      audioSystem.playSFX("hit_multi_partial");
      this.vfx?.emitSubHit(target.x, target.y, target.color);
    } else if (target.kind === "shielded") {
      audioSystem.playSFX("hit_shielded_break");
    }
  }

  private spawnFrenzyBurst(x: number, y: number): void {
    if (this.spawnSystem === null || this.app === null) return;
    const { width, height } = this.app.renderer.screen;
    const burst = this.spawnSystem.onTargetHit(x, y, { width, height });
    if (burst.length > 0) this.spawnEvents(burst);
  }

  private spawnSplitterFragments(x: number, y: number): void {
    if (this.targetLayer === null) return;
    const lifetimeMul =
      (SPLITTER_FRAGMENT_LIFETIME_MS / TARGET_CONFIG.regular.lifetimeMs) *
      this.targetMods.lifetimeMul;
    for (let i = 0; i < SPLITTER_FRAGMENT_COUNT; i++) {
      const angle =
        (Math.PI * 2 * i) / SPLITTER_FRAGMENT_COUNT + Math.random() * 0.5;
      const dist =
        SPLITTER_FRAGMENT_SPREAD_MIN +
        Math.random() * SPLITTER_FRAGMENT_SPREAD_RANGE;
      const modifiers: TargetSpawnModifiers = {
        ...this.targetMods,
        lifetimeMul,
        sizeMul: this.targetMods.sizeMul * SPLITTER_FRAGMENT_SIZE_MUL,
        scoreMul: this.targetMods.scoreMul * SPLITTER_FRAGMENT_SCORE_MUL,
      };
      const fragment = new RegularTarget(
        { x: x + Math.cos(angle) * dist, y: y + Math.sin(angle) * dist },
        modifiers,
      );
      fragment.bindPointerDown(() => this.handleTargetClick(fragment));
      this.targetLayer.addChild(fragment.view);
      this.targets.push(fragment);
    }
  }

  private spawnEchoPhantom(target: Target, awardedScore: number): void {
    const echo = this.runMods.echoPhantom;
    if (echo === null || this.phantomLayer === null) return;
    const bonus = Math.round(awardedScore * (echo.bonusMul - 1));
    if (bonus <= 0) return;
    const phantom = new PhantomTarget({
      x: target.x,
      y: target.y,
      radius: Math.max(target.currentSize, 12),
      color: target.color,
      bonusScore: bonus,
      lifetimeMs: echo.durationMs,
    });
    phantom.graphics.on("pointerdown", () => this.handlePhantomClick(phantom));
    this.phantomLayer.addChild(phantom.graphics);
    this.phantoms.push(phantom);
  }

  private handlePhantomClick(phantom: PhantomTarget): void {
    if (useRunStore.getState().paused) return;
    if (!phantom.isInteractive) return;
    phantom.collect();
    useRunStore.getState().addScore(phantom.bonusScore);
    audioSystem.playSFX("hit_multi_partial");
    this.vfx?.emitSubHit(phantom.x, phantom.y, phantom.color);
  }

  private killPair(target: Target): void {
    const pair = target.pairTarget;
    if (pair === null) return;
    target.pairTarget = null;
    pair.pairTarget = null;
    pair.beginPairKill();
  }

  private handleBombClick(bomb: Target): void {
    const store = useRunStore.getState();
    store.recordBombClick();
    this.awardBombCashout(bomb);
    const count = useRunStore.getState().bombClicksThisRun;
    const free = this.runMods.bombClickFreeAfterFirst && count > 1;
    if (!free) this.applyBombPenalty();
    if (!this.runMods.comboNoResetOnBombClick) {
      useRunStore.getState().resetCombo();
      this.syncMusicToCombo();
    }
  }

  private awardBombCashout(bomb: Target): void {
    const cashout = this.runMods.bombComboCashout;
    if (cashout <= 0) return;
    const combo = useRunStore.getState().combo;
    const mult = comboMultiplier(combo, this.runMods.comboCap);
    const points = Math.round(
      TARGET_CONFIG.regular.score *
        cashout *
        mult *
        this.runMods.scoreMul *
        this.scoreMultiplier.current,
    );
    if (points <= 0) return;
    useRunStore.getState().addScore(points);
    this.vfx?.emitSubHit(bomb.x, bomb.y, TARGET_CONFIG.regular.color);
  }

  private tryAwardBombBounty(): void {
    const chance = this.runMods.bombExpireCurrencyChance;
    if (chance <= 0 || this.runMods.currencyDisabled) return;
    if (Math.random() >= chance) return;
    this.bombBountyEarned += 1;
  }

  private tryAwardComboCoin(): void {
    const cfg = this.runMods.currencyPerHit;
    if (cfg === null || this.runMods.currencyDisabled) return;
    const combo = useRunStore.getState().combo;
    if (combo < cfg.combo) return;
    this.comboCoinEarned += cfg.amount;
  }

  private awardRunRewards(victory: boolean): void {
    const run = useRunStore.getState();
    const meta = useMetaStore.getState();
    const score = run.score;
    const maxCombo = run.maxCombo;
    const bombClicks = run.bombClicksThisRun;
    const disabled = this.runMods.currencyDisabled;
    const isFirstRunEver = meta.runsCompleted === 0;

    const base = disabled ? 0 : Math.floor(score / SCORE_PER_CURRENCY);
    const comboBonus = disabled ? 0 : comboBonusForMax(maxCombo);

    const achievements: AchievementAward[] = [];
    if (!disabled) {
      const candidates: { id: string; amount: number; condition: boolean }[] = [
        {
          id: "first-run",
          amount: ACHIEVEMENT_REWARDS["first-run"],
          condition: isFirstRunEver,
        },
        {
          id: "combo-25",
          amount: ACHIEVEMENT_REWARDS["combo-25"],
          condition: maxCombo >= 25,
        },
        {
          id: "combo-50",
          amount: ACHIEVEMENT_REWARDS["combo-50"],
          condition: maxCombo >= 50,
        },
        {
          id: "combo-100",
          amount: ACHIEVEMENT_REWARDS["combo-100"],
          condition: maxCombo >= 100,
        },
        {
          id: "no-bomb-clicks",
          amount: ACHIEVEMENT_REWARDS["no-bomb-clicks"],
          condition: bombClicks === 0,
        },
      ];
      for (const c of candidates) {
        if (!c.condition) continue;
        if (meta.unlockAchievement(c.id)) {
          achievements.push({ id: c.id, amount: c.amount });
        }
      }
    }

    const achievementsTotal = achievements.reduce((s, a) => s + a.amount, 0);
    const victoryBonus = !disabled && victory ? VICTORY_BONUS_CURRENCY : 0;
    const endTotal = base + comboBonus + achievementsTotal + victoryBonus;
    const sessionTotal =
      endTotal + this.bombBountyEarned + this.comboCoinEarned;
    if (!disabled && sessionTotal > 0) meta.awardCurrency(sessionTotal);
    const previousBestScore = meta.bestScores[run.mode] ?? 0;
    meta.recordRun(run.mode, score);

    const breakdown: CurrencyBreakdown = {
      base,
      comboBonus,
      bombBounty: this.bombBountyEarned,
      comboCoin: this.comboCoinEarned,
      victoryBonus,
      achievements,
      total: sessionTotal,
    };
    run.recordRunResults({
      currencyEarned: breakdown.total,
      currencyBreakdown: breakdown,
      previousBestScore,
    });
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
    haptic("milestone");
    audioSystem.musicSwell();
    this.camera?.shake(FEEL.shake.comboIntensity, FEEL.shake.comboMs);
    this.ultimateSystem?.addCharge(CHARGE_PER_COMBO_MILESTONE);
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
    this.physics?.removeTarget(target.id);
    this.targets.splice(index, 1);
    target.destroy();
  }

  private bindToPhysics(target: Target): void {
    if (this.physics === null) return;
    target.physicsControlled = true;
    const speed = PHYSICS_SPEED_MIN + Math.random() * PHYSICS_SPEED_RANGE;
    const angle = Math.random() * Math.PI * 2;
    this.physics.addTarget(
      target,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
    );
  }

  private processStickyMerges(): void {
    if (this.physics === null) return;
    const pairs = this.physics.takeCollisions();
    for (const [idA, idB] of pairs) {
      const a = this.findSticky(idA);
      const b = this.findSticky(idB);
      if (a === null || b === null || a === b) continue;
      if (!a.isInteractive || !b.isInteractive) continue;
      const keep = a.cluster >= b.cluster ? a : b;
      const gone = keep === a ? b : a;
      const beforeRadius = keep.clusterRadius;
      keep.absorb(gone);
      this.physics.scaleBody(keep.id, keep.clusterRadius / beforeRadius);
      this.removeTargetInstance(gone);
      audioSystem.playSFX("hit_multi_partial");
      this.vfx?.emitSubHit(keep.x, keep.y, keep.color);
    }
  }

  private findSticky(id: string): StickyTarget | null {
    for (const target of this.targets) {
      if (target.id === id && target instanceof StickyTarget) return target;
    }
    return null;
  }

  private removeTargetInstance(target: Target): void {
    const index = this.targets.indexOf(target);
    if (index >= 0) this.removeTargetAt(index);
  }

  get fps(): number {
    return this.app?.ticker.FPS ?? 0;
  }

  stop(): void {
    this.app?.ticker.stop();
  }

  destroy(): void {
    this.destroyed = true;
    window.removeEventListener("keydown", this.handleKeydown);
    this.unsubTheme?.();
    this.unsubTheme = null;
    this.unsubReduceMotion?.();
    this.unsubReduceMotion = null;
    clearUltimateActivationHandler(this.ultimateHandler);
    clearRunPerkPickHandler(this.runPerkHandler);
    if (this.ultimateSystem !== null) {
      const ctx = this.buildUltimateContext();
      if (ctx !== null) this.ultimateSystem.forceCleanup(ctx);
      this.ultimateSystem = null;
    }
    this.physics?.destroy();
    this.physics = null;
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
    for (const phantom of this.phantoms) phantom.destroy();
    this.phantoms.length = 0;
    if (this.background !== null) {
      this.app.stage.removeChild(this.background.view);
      this.background.destroy();
      this.background = null;
    }
    this.app.destroy(true, { children: true });
    this.app = null;
    this.targetLayer = null;
    this.phantomLayer = null;
    this.ultimateCtx = null;
    this.ultimateTimeScale = 1;
    this.spawnSystem = null;
    this.vfx = null;
    this.camera = null;
  }
}
