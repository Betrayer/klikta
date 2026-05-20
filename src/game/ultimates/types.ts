import type { Application } from "pixi.js";
import type { Target } from "../entities/Target";
import type { SpawnSystem } from "../systems/SpawnSystem";
import type { VFXSystem } from "../systems/VFXSystem";

export interface GameContext {
  app: Application;
  spawnSystem: SpawnSystem;
  targets: readonly Target[];
  vfx: VFXSystem;
  scoreMultiplier: { current: number };
}

export interface UltimateImpl {
  id: string;
  durationMs: number;
  blocksOthers: boolean;
  apply: (ctx: GameContext) => void;
  update?: (ctx: GameContext, elapsedMs: number) => void;
  cleanup: (ctx: GameContext) => void;
}
