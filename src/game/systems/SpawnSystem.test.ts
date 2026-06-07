import { describe, expect, it } from "vitest";
import { SpawnSystem, type SpawnEvent } from "./SpawnSystem";
import {
  DEFAULT_SPAWN_POLICY,
  DEFAULT_TARGET_MODIFIERS,
  type SpawnPolicy,
} from "../effects/EffectResolver";

const BOUNDS = { width: 1000, height: 800 };

const policyWith = (over: Partial<SpawnPolicy>): SpawnPolicy => ({
  ...DEFAULT_SPAWN_POLICY,
  ...over,
});

const collectEvents = (system: SpawnSystem, ticks: number): SpawnEvent[] => {
  const events: SpawnEvent[] = [];
  for (let i = 1; i <= ticks; i++) {
    events.push(...system.tick(i * 2000, BOUNDS));
  }
  return events;
};

const inEdgeBand = (e: SpawnEvent): boolean => {
  const mX = BOUNDS.width * 0.1;
  const bX = BOUNDS.width * 0.2;
  const mY = BOUNDS.height * 0.1;
  const bY = BOUNDS.height * 0.2;
  const xEdge =
    (e.x >= mX - 1 && e.x <= bX + 1) ||
    (e.x >= BOUNDS.width - bX - 1 && e.x <= BOUNDS.width - mX + 1);
  const yEdge =
    (e.y >= mY - 1 && e.y <= bY + 1) ||
    (e.y >= BOUNDS.height - bY - 1 && e.y <= BOUNDS.height - mY + 1);
  return xEdge || yEdge;
};

describe("SpawnSystem rebalance behaviours", () => {
  it("places edge-only bombs near the screen edges (Steady Bombs)", () => {
    const system = new SpawnSystem(
      0,
      policyWith({ bombEdgeOnly: true }),
      DEFAULT_TARGET_MODIFIERS,
    );
    system.setKindPool(["bomb"]);
    const events = collectEvents(system, 60);
    expect(events.length).toBeGreaterThan(20);
    for (const e of events) {
      expect(e.kind).toBe("bomb");
      expect(inEdgeBand(e)).toBe(true);
    }
  });

  it("keeps non-edge bombs anywhere when the policy is off", () => {
    const system = new SpawnSystem(0, DEFAULT_SPAWN_POLICY, DEFAULT_TARGET_MODIFIERS);
    system.setKindPool(["bomb"]);
    const events = collectEvents(system, 80);
    expect(events.some((e) => !inEdgeBand(e))).toBe(true);
  });

  it("turns mirror twins into bombs at the configured chance (Mirror Spawn nerf)", () => {
    const system = new SpawnSystem(
      0,
      policyWith({ mirrorSpawn: true, mirrorBombTwinChance: 1 }),
      DEFAULT_TARGET_MODIFIERS,
    );
    system.setKindPool(["regular"]);
    const events = collectEvents(system, 20);
    expect(events.length).toBeGreaterThan(0);
    expect(events.length % 2).toBe(0);
    for (let i = 0; i < events.length; i += 2) {
      expect(events[i]?.kind).toBe("regular");
      expect(events[i + 1]?.kind).toBe("bomb");
    }
  });

  it("reports surge windows for combo protection (Rush Pulse)", () => {
    const system = new SpawnSystem(
      0,
      policyWith({
        spawnRateSurge: {
          periodMs: 1000,
          durationMs: 500,
          mul: 3,
          comboProtected: true,
        },
      }),
      DEFAULT_TARGET_MODIFIERS,
    );
    expect(system.surgeActive(0)).toBe(false);
    expect(system.surgeActive(1000)).toBe(true);
    expect(system.surgeActive(1400)).toBe(true);
    expect(system.surgeActive(1600)).toBe(false);
    expect(system.surgeActive(2100)).toBe(true);
  });

  it("never reports a surge when none is configured", () => {
    const system = new SpawnSystem(0, DEFAULT_SPAWN_POLICY, DEFAULT_TARGET_MODIFIERS);
    expect(system.surgeActive(99999)).toBe(false);
  });
});
