import type { BackgroundSpec } from "../../data/themes/types";

const LOW_FPS_THRESHOLD = 50;
const SUSTAINED_LOW_MS = 3000;

export class FpsMonitor {
  private lowMs = 0;
  private triggered = false;

  sample(deltaMs: number): boolean {
    if (this.triggered || deltaMs <= 0) return false;
    const fps = 1000 / deltaMs;
    if (fps < LOW_FPS_THRESHOLD) {
      this.lowMs += deltaMs;
      if (this.lowMs >= SUSTAINED_LOW_MS) {
        this.triggered = true;
        return true;
      }
    } else {
      this.lowMs = Math.max(0, this.lowMs - deltaMs);
    }
    return false;
  }

  get isTriggered(): boolean {
    return this.triggered;
  }

  reset(): void {
    this.lowMs = 0;
    this.triggered = false;
  }
}

export const reduceBackgroundSpec = (spec: BackgroundSpec): BackgroundSpec => {
  if (spec.kind === "animated_gradient") {
    const stops = spec.colorStops;
    const first = stops?.[0];
    const last = stops !== undefined ? stops[stops.length - 1] : undefined;
    if (first !== undefined && last !== undefined) {
      return {
        kind: "gradient",
        color: spec.color,
        gradientFrom: first,
        gradientTo: last,
      };
    }
    return { ...spec, kind: "gradient" };
  }
  if (spec.kind === "bokeh" || spec.kind === "noise") {
    return { kind: "solid", color: spec.color };
  }
  return spec;
};
