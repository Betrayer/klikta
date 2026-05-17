import {
  Application,
  Container,
  type FederatedPointerEvent,
  type Ticker,
} from 'pixi.js';
import { Target } from '../entities/Target';
import { SpawnSystem, type SpawnEvent } from '../systems/SpawnSystem';
import { useRunStore } from '../../state/runStore';

export class Game {
  private readonly parent: HTMLElement;
  private app: Application | null = null;
  private targetLayer: Container | null = null;
  private readonly targets: Target[] = [];
  private spawnSystem: SpawnSystem | null = null;
  private clockMs = 0;
  private destroyed = false;

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  async start(): Promise<void> {
    const app = new Application();
    await app.init({
      resizeTo: this.parent,
      background: '#1a0033',
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

    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    app.stage.on('pointerdown', this.handleStagePointerDown);

    this.spawnSystem = new SpawnSystem(this.clockMs);
    app.ticker.add(this.tick);
  }

  private handleStagePointerDown = (event: FederatedPointerEvent): void => {
    if (this.app !== null && event.target === this.app.stage) {
      useRunStore.getState().loseHP();
    }
  };

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

    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      if (target === undefined) continue;
      target.update(deltaMs);
      if (!target.alive) {
        this.removeTargetAt(i);
      }
    }

    const { width, height } = this.app.renderer.screen;
    const event = this.spawnSystem.tick(this.clockMs, { width, height });
    if (event !== null) this.spawnTarget(event);
  };

  private spawnTarget(event: SpawnEvent): void {
    if (this.targetLayer === null) return;
    const target = new Target({
      x: event.x,
      y: event.y,
      lifetimeMs: event.lifetimeMs,
      score: 10,
    });
    target.graphics.on('pointerdown', () => this.handleTargetClick(target));
    this.targetLayer.addChild(target.graphics);
    this.targets.push(target);
  }

  private handleTargetClick(target: Target): void {
    if (!target.alive) return;
    target.alive = false;
    const index = this.targets.indexOf(target);
    if (index !== -1) this.removeTargetAt(index);
    useRunStore.getState().addScore(target.score);
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
    this.app.stage.off('pointerdown', this.handleStagePointerDown);
    for (const target of this.targets) target.destroy();
    this.targets.length = 0;
    this.app.destroy(true, { children: true });
    this.app = null;
    this.targetLayer = null;
    this.spawnSystem = null;
  }
}
