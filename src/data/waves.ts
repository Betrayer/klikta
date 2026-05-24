import type { TargetKind } from "./targetConfig";

export interface WaveDensity {
  intervalMs: number;
  weights: Partial<Record<TargetKind, number>>;
}

export interface Wave {
  index: number;
  durationMs: number;
  density: WaveDensity;
}

export const WAVES: readonly Wave[] = [
  {
    index: 1,
    durationMs: 9000,
    density: { intervalMs: 1150, weights: { regular: 100 } },
  },
  {
    index: 2,
    durationMs: 9000,
    density: { intervalMs: 1050, weights: { regular: 90, golden: 12 } },
  },
  {
    index: 3,
    durationMs: 10000,
    density: { intervalMs: 1000, weights: { regular: 80, golden: 12, multi: 16 } },
  },
  {
    index: 4,
    durationMs: 10000,
    density: {
      intervalMs: 950,
      weights: { regular: 72, golden: 12, multi: 16, bomb: 14 },
    },
  },
  {
    index: 5,
    durationMs: 12000,
    density: {
      intervalMs: 800,
      weights: { regular: 64, golden: 14, multi: 22, bomb: 22 },
    },
  },
  {
    index: 6,
    durationMs: 10500,
    density: {
      intervalMs: 900,
      weights: { regular: 60, golden: 12, multi: 18, bomb: 16, shielded: 16 },
    },
  },
  {
    index: 7,
    durationMs: 11000,
    density: {
      intervalMs: 850,
      weights: { regular: 54, golden: 12, multi: 20, bomb: 18, shielded: 18 },
    },
  },
  {
    index: 8,
    durationMs: 11000,
    density: {
      intervalMs: 850,
      weights: {
        regular: 48,
        golden: 12,
        multi: 18,
        bomb: 18,
        shielded: 16,
        splitter: 18,
      },
    },
  },
  {
    index: 9,
    durationMs: 11500,
    density: {
      intervalMs: 800,
      weights: {
        regular: 44,
        golden: 12,
        multi: 18,
        bomb: 22,
        shielded: 18,
        splitter: 22,
      },
    },
  },
  {
    index: 10,
    durationMs: 13000,
    density: {
      intervalMs: 700,
      weights: {
        regular: 40,
        golden: 16,
        multi: 22,
        bomb: 26,
        shielded: 20,
        splitter: 24,
      },
    },
  },
  {
    index: 11,
    durationMs: 11500,
    density: {
      intervalMs: 760,
      weights: {
        regular: 40,
        golden: 12,
        multi: 20,
        bomb: 24,
        shielded: 22,
        splitter: 24,
      },
    },
  },
  {
    index: 12,
    durationMs: 12000,
    density: {
      intervalMs: 720,
      weights: {
        regular: 36,
        golden: 12,
        multi: 22,
        bomb: 26,
        shielded: 24,
        splitter: 26,
      },
    },
  },
  {
    index: 13,
    durationMs: 12000,
    density: {
      intervalMs: 700,
      weights: {
        regular: 34,
        golden: 14,
        multi: 24,
        bomb: 28,
        shielded: 24,
        splitter: 28,
      },
    },
  },
  {
    index: 14,
    durationMs: 12500,
    density: {
      intervalMs: 660,
      weights: {
        regular: 32,
        golden: 14,
        multi: 24,
        bomb: 30,
        shielded: 26,
        splitter: 30,
      },
    },
  },
  {
    index: 15,
    durationMs: 14000,
    density: {
      intervalMs: 600,
      weights: {
        regular: 30,
        golden: 18,
        multi: 26,
        bomb: 32,
        shielded: 28,
        splitter: 32,
      },
    },
  },
];
