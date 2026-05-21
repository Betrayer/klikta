import type { Application, Container } from "pixi.js";
import type { Target } from "../entities/Target";
import type { SpawnSystem } from "../systems/SpawnSystem";
import type { VFXSystem } from "../systems/VFXSystem";

export interface UltimateAudio {
  playSFX: (name: string) => void;
  musicSwell: () => void;
}

export interface GameContext {
  app: Application;
  overlay: Container;
  spawnSystem: SpawnSystem;
  targets: readonly Target[];
  vfx: VFXSystem;
  audio: UltimateAudio;
  scoreMultiplier: { current: number };
  setTimeScale: (scale: number) => void;
  shake: (intensity: number, durationMs: number) => void;
  disableHpRegen: () => void;
}

export interface UltimateImpl {
  id: string;
  durationMs: number;
  blocksOthers: boolean;
  apply: (ctx: GameContext) => void;
  update?: (ctx: GameContext, elapsedMs: number) => void;
  cleanup: (ctx: GameContext) => void;
}
