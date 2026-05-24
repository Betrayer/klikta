import * as Matter from "matter-js";
import type { Target } from "../entities/Target";
import {
  PHYSICS_CLICK_IMPULSE,
  PHYSICS_FIXED_STEP_MS,
  PHYSICS_MAX_SPEED,
  PHYSICS_MAX_SUBSTEPS,
  PHYSICS_RESTITUTION,
  PHYSICS_SPIN_RANGE,
  PHYSICS_WALL_THICKNESS,
} from "../config/balance";

export interface PhysicsBounds {
  width: number;
  height: number;
}

interface BodyMotion {
  prevX: number;
  prevY: number;
  prevAngle: number;
  curX: number;
  curY: number;
  curAngle: number;
}

const WALL_LABEL = "wall";

export class PhysicsEngine {
  private engine: Matter.Engine | null = null;
  private walls: Matter.Body[] = [];
  private readonly bodies = new Map<string, Matter.Body>();
  private readonly motion = new Map<string, BodyMotion>();
  private collisions: Array<[string, string]> = [];
  private accumulatorMs = 0;
  private interpAlpha = 0;

  private readonly onCollision = (
    event: Matter.IEventCollision<Matter.Engine>,
  ): void => {
    for (const pair of event.pairs) {
      this.collisions.push([pair.bodyA.label, pair.bodyB.label]);
    }
  };

  init(bounds: PhysicsBounds): void {
    const engine = Matter.Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 0;
    this.engine = engine;
    Matter.Events.on(engine, "collisionStart", this.onCollision);
    this.buildWalls(bounds);
  }

  resize(bounds: PhysicsBounds): void {
    this.buildWalls(bounds);
  }

  addTarget(target: Target, vx: number, vy: number): void {
    if (this.engine === null) return;
    const body = Matter.Bodies.circle(target.x, target.y, target.currentSize, {
      restitution: PHYSICS_RESTITUTION,
      friction: 0,
      frictionAir: 0,
      frictionStatic: 0,
      label: target.id,
    });
    Matter.Body.setVelocity(body, { x: vx, y: vy });
    Matter.Body.setAngularVelocity(
      body,
      (Math.random() - 0.5) * PHYSICS_SPIN_RANGE,
    );
    this.bodies.set(target.id, body);
    this.motion.set(target.id, {
      prevX: target.x,
      prevY: target.y,
      prevAngle: 0,
      curX: target.x,
      curY: target.y,
      curAngle: 0,
    });
    Matter.Composite.add(this.engine.world, body);
  }

  removeTarget(id: string): void {
    if (this.engine === null) return;
    this.motion.delete(id);
    const body = this.bodies.get(id);
    if (body === undefined) return;
    Matter.Composite.remove(this.engine.world, body);
    this.bodies.delete(id);
  }

  scaleBody(id: string, factor: number): void {
    if (factor === 1) return;
    const body = this.bodies.get(id);
    if (body === undefined) return;
    Matter.Body.scale(body, factor, factor);
  }

  applyClickImpulse(x: number, y: number, radius: number): void {
    const r2 = radius * radius;
    for (const body of this.bodies.values()) {
      const dx = body.position.x - x;
      const dy = body.position.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 > r2) continue;
      const d = Math.sqrt(d2) || 1;
      const push = PHYSICS_CLICK_IMPULSE * (1 - d / radius);
      Matter.Body.setVelocity(body, {
        x: body.velocity.x + (dx / d) * push,
        y: body.velocity.y + (dy / d) * push,
      });
    }
  }

  update(deltaMs: number): void {
    if (this.engine === null) return;
    this.accumulatorMs += deltaMs;
    let steps = 0;
    while (
      this.accumulatorMs >= PHYSICS_FIXED_STEP_MS &&
      steps < PHYSICS_MAX_SUBSTEPS
    ) {
      this.carryPreviousMotion();
      Matter.Engine.update(this.engine, PHYSICS_FIXED_STEP_MS);
      this.captureCurrentMotion();
      this.clampSpeeds();
      this.accumulatorMs -= PHYSICS_FIXED_STEP_MS;
      steps += 1;
    }
    if (this.accumulatorMs > PHYSICS_FIXED_STEP_MS) this.accumulatorMs = 0;
    this.interpAlpha = this.accumulatorMs / PHYSICS_FIXED_STEP_MS;
  }

  syncToTargets(targets: readonly Target[]): void {
    const alpha = this.interpAlpha;
    for (const target of targets) {
      const m = this.motion.get(target.id);
      if (m === undefined) continue;
      target.x = m.prevX + (m.curX - m.prevX) * alpha;
      target.y = m.prevY + (m.curY - m.prevY) * alpha;
      target.graphics.rotation =
        m.prevAngle + (m.curAngle - m.prevAngle) * alpha;
    }
  }

  private carryPreviousMotion(): void {
    for (const m of this.motion.values()) {
      m.prevX = m.curX;
      m.prevY = m.curY;
      m.prevAngle = m.curAngle;
    }
  }

  private captureCurrentMotion(): void {
    for (const [id, m] of this.motion) {
      const body = this.bodies.get(id);
      if (body === undefined) continue;
      m.curX = body.position.x;
      m.curY = body.position.y;
      m.curAngle = body.angle;
    }
  }

  private clampSpeeds(): void {
    for (const body of this.bodies.values()) {
      const speed = Math.hypot(body.velocity.x, body.velocity.y);
      if (speed <= PHYSICS_MAX_SPEED) continue;
      const scale = PHYSICS_MAX_SPEED / speed;
      Matter.Body.setVelocity(body, {
        x: body.velocity.x * scale,
        y: body.velocity.y * scale,
      });
    }
  }

  takeCollisions(): Array<[string, string]> {
    if (this.collisions.length === 0) return [];
    const out = this.collisions;
    this.collisions = [];
    return out;
  }

  destroy(): void {
    const engine = this.engine;
    if (engine !== null) {
      Matter.Events.off(engine, "collisionStart", this.onCollision);
      Matter.Composite.clear(engine.world, false);
      Matter.Engine.clear(engine);
      this.engine = null;
    }
    this.bodies.clear();
    this.motion.clear();
    this.walls = [];
    this.collisions = [];
    this.accumulatorMs = 0;
    this.interpAlpha = 0;
  }

  private buildWalls(bounds: PhysicsBounds): void {
    if (this.engine === null) return;
    for (const wall of this.walls) {
      Matter.Composite.remove(this.engine.world, wall);
    }
    const t = PHYSICS_WALL_THICKNESS;
    const { width, height } = bounds;
    const opts: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      restitution: PHYSICS_RESTITUTION,
      friction: 0,
      label: WALL_LABEL,
    };
    const walls = [
      Matter.Bodies.rectangle(width / 2, -t / 2, width + t * 2, t, opts),
      Matter.Bodies.rectangle(
        width / 2,
        height + t / 2,
        width + t * 2,
        t,
        opts,
      ),
      Matter.Bodies.rectangle(-t / 2, height / 2, t, height + t * 2, opts),
      Matter.Bodies.rectangle(
        width + t / 2,
        height / 2,
        t,
        height + t * 2,
        opts,
      ),
    ];
    this.walls = walls;
    Matter.Composite.add(this.engine.world, walls);
  }
}
