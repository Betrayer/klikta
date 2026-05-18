import { TARGET_CONFIG, type TargetKind } from '../../data/targetConfig';

export interface SpawnBounds {
  width: number;
  height: number;
}

export interface SpawnEvent {
  x: number;
  y: number;
  kind: TargetKind;
}

const INITIAL_INTERVAL_MS = 1500;
const EDGE_MARGIN = 0.1;
const DECAY_EVERY_MS = 10_000;
const DECAY_FACTOR = 0.95;
const MIN_INTERVAL_MS = 300;

const KINDS = Object.keys(TARGET_CONFIG) as TargetKind[];

export class SpawnSystem {
  private spawnIntervalMs = INITIAL_INTERVAL_MS;
  private nextSpawnAt: number;
  private nextDecayAt: number;

  constructor(startTimeMs: number) {
    this.nextSpawnAt = startTimeMs + this.spawnIntervalMs;
    this.nextDecayAt = startTimeMs + DECAY_EVERY_MS;
  }

  tick(currentTimeMs: number, bounds: SpawnBounds): SpawnEvent | null {
    if (currentTimeMs >= this.nextDecayAt) {
      this.spawnIntervalMs = Math.max(
        this.spawnIntervalMs * DECAY_FACTOR,
        MIN_INTERVAL_MS,
      );
      this.nextDecayAt += DECAY_EVERY_MS;
    }

    if (currentTimeMs < this.nextSpawnAt) return null;
    this.nextSpawnAt = currentTimeMs + this.spawnIntervalMs;

    const marginX = bounds.width * EDGE_MARGIN;
    const marginY = bounds.height * EDGE_MARGIN;
    return {
      x: marginX + Math.random() * (bounds.width - marginX * 2),
      y: marginY + Math.random() * (bounds.height - marginY * 2),
      kind: this.pickKind(),
    };
  }

  private pickKind(): TargetKind {
    let total = 0;
    for (const kind of KINDS) total += TARGET_CONFIG[kind].spawnWeight;

    let roll = Math.random() * total;
    for (const kind of KINDS) {
      roll -= TARGET_CONFIG[kind].spawnWeight;
      if (roll < 0) return kind;
    }
    return 'regular';
  }
}
