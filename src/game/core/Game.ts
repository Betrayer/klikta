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
import type { TargetKind } from "../../data/targetConfig";
import { tweenManager } from "../util/TweenManager";
import { FEEL } from "../config/feel";
import { useRunStore } from "../../state/runStore";

export class Game {
  private readonly parent: HTMLElement;
  private app: Application | null = null;
  private targetLayer: Container | null = null;
  private readonly targets: Target[] = [];
  private spawnSystem: SpawnSystem | null = null;
  private vfx: VFXSystem | null = null;
  private camera: CameraSystem | null = null;
  private flashGfx: Graphics | null = null;
  private hitFrameUntil = 0;
  private flashStartMs = -1;
  private clockMs = 0;
  private destroyed = false;

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  async start(): Promise<void> {
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

    tweenManager.clear();
    this.spawnSystem = new SpawnSystem(this.clockMs);
    app.ticker.add(this.tick);
  }

  private handleStagePointerDown = (event: FederatedPointerEvent): void => {
    if (this.app !== null && event.target === this.app.stage) {
      useRunStore.getState().loseHP();
    }
  };

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
    this.app.ticker.speed = FEEL.hitFrameSlow;
    this.hitFrameUntil = performance.now() + FEEL.hitFrameMs;
    this.flashStartMs = performance.now();
  }

  private updateHitFrame(): void {
    if (this.app === null) return;
    const now = performance.now();
    if (this.app.ticker.speed !== 1 && now >= this.hitFrameUntil) {
      this.app.ticker.speed = 1;
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

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      if (target === undefined) continue;
      target.update(deltaMs);
      if (target.isDead) {
        this.removeTargetAt(i);
      }
    }

    const { width, height } = this.app.renderer.screen;
    const event = this.spawnSystem.tick(this.clockMs, { width, height });
    if (event !== null) this.spawnTarget(event);
  };

  private createTarget(kind: TargetKind, x: number, y: number): Target {
    const spawn = { x, y };
    switch (kind) {
      case "regular":
        return new RegularTarget(spawn);
      case "golden":
        return new GoldenTarget(spawn);
      case "bomb":
        return new BombTarget(spawn);
      case "multi":
        return new MultiTarget(spawn);
      case "shielded":
        return new ShieldedTarget(spawn);
    }
  }

  private spawnTarget(event: SpawnEvent): void {
    if (this.targetLayer === null) return;
    const target = this.createTarget(event.kind, event.x, event.y);
    target.graphics.on("pointerdown", () => this.handleTargetClick(target));
    this.targetLayer.addChild(target.graphics);
    this.targets.push(target);
  }

  private handleTargetClick(target: Target): void {
    if (!target.isInteractive) return;

    const result = target.onClick();

    if (result.effects.includes("lose_hp")) {
      useRunStore.getState().loseHP();
    }

    if (result.destroyed) {
      if (result.score > 0) {
        useRunStore.getState().addScore(result.score);
      }
      this.emitHitVfx(target);
      this.triggerJuice(target);
      target.beginHitExit();
    } else if (target.kind === "multi") {
      this.vfx?.emitSubHit(target.x, target.y, target.color);
    }
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
    this.app.renderer.off("resize", this.handleResize);
    this.app.stage.off("pointerdown", this.handleStagePointerDown);
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
