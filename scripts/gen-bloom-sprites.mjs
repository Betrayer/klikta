import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "../src/assets/themes/bloom");
const SIZE = 128;
const SS = 4;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
};

const encodePng = (width, height, rgba) => {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const clamp01 = (v) => clamp(v, 0, 1);
const mix = (a, b, t) => a + (b - a) * t;
const mixRgb = (a, b, t) => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t),
  mix(a[2], b[2], t),
];
const hexRgb = (hex) => [
  ((hex >> 16) & 0xff) / 255,
  ((hex >> 8) & 0xff) / 255,
  (hex & 0xff) / 255,
];

const WHITE = [1, 1, 1];
const FEATHER = 0.04;
const ROT = -Math.PI / 2;

const shapeAlpha = (d, radius) => clamp01((radius - d) / FEATHER);

const flowerAlpha = (px, py, geo) => {
  let a = shapeAlpha(Math.hypot(px, py), geo.centerR);
  for (let i = 0; i < geo.petals; i++) {
    const angle = ROT + (i * Math.PI * 2) / geo.petals;
    const cx = Math.cos(angle) * geo.petalDist;
    const cy = Math.sin(angle) * geo.petalDist;
    a = Math.max(a, shapeAlpha(Math.hypot(px - cx, py - cy), geo.petalR));
  }
  return a;
};

const flowerShade = (px, py, geo, petal, center) => {
  const d = Math.hypot(px, py);
  const dome = clamp01(1 - d / geo.outerR);
  let rgb = petal.map((c) => c * (0.6 + 0.4 * dome));
  const stamen = clamp01(1 - d / geo.centerR);
  rgb = mixRgb(rgb, center, Math.pow(stamen, 1.4) * 0.92);
  const sx = px + 0.28;
  const sy = py + 0.3;
  const spec = Math.max(0, 1 - Math.hypot(sx, sy) / 0.55);
  rgb = mixRgb(rgb, WHITE, Math.pow(spec, 2) * 0.16);
  return rgb;
};

const softFlower = (px, py, geo, petal, center) => {
  const a = flowerAlpha(px, py, geo);
  if (a <= 0) return null;
  return { rgb: flowerShade(px, py, geo, petal, center), a };
};

const BUD = { petals: 5, petalDist: 0.16, petalR: 0.4, centerR: 0.3, outerR: 0.56 };
const OPENING = {
  petals: 5,
  petalDist: 0.36,
  petalR: 0.42,
  centerR: 0.24,
  outerR: 0.78,
};
const BLOOM = {
  petals: 5,
  petalDist: 0.5,
  petalR: 0.46,
  centerR: 0.26,
  outerR: 0.96,
};

const PINK = hexRgb(0xff8fb8);
const YELLOW = hexRgb(0xffd66b);
const PALE_YELLOW = hexRgb(0xfff2b0);
const GREEN = hexRgb(0x86c98f);
const PALE_GREEN = hexRgb(0xbfe6a0);
const VIOLET = hexRgb(0xb388ff);
const LIGHT_VIOLET = hexRgb(0xc59be8);
const GOLD = hexRgb(0xffd35e);
const TEAL = hexRgb(0x57c9bd);
const SHIELD_GREEN = hexRgb(0x5fae7a);
const ORANGE = hexRgb(0xff9a52);
const STICKY = hexRgb(0x6fd9cc);
const MAROON = hexRgb(0x7a2342);

const SHAPERS = {
  regular: (px, py) => softFlower(px, py, BLOOM, PINK, YELLOW),
  multi_3: (px, py) => softFlower(px, py, BUD, GREEN, PALE_GREEN),
  multi_2: (px, py) => softFlower(px, py, OPENING, LIGHT_VIOLET, YELLOW),
  multi_1: (px, py) => softFlower(px, py, BLOOM, VIOLET, YELLOW),
  golden: (px, py) => {
    const base = softFlower(px, py, BLOOM, GOLD, PALE_YELLOW);
    if (base === null) return null;
    const gx = px + 0.3;
    const gy = py + 0.32;
    const gd = Math.hypot(gx, gy);
    const cross = Math.max(
      Math.max(0, 1 - Math.abs(gx) / 0.03) *
        Math.max(0, 1 - Math.abs(gy) / 0.34),
      Math.max(0, 1 - Math.abs(gy) / 0.03) *
        Math.max(0, 1 - Math.abs(gx) / 0.34),
    );
    const sparkle = Math.max(Math.pow(Math.max(0, 1 - gd / 0.3), 2), cross);
    return { rgb: mixRgb(base.rgb, WHITE, clamp01(sparkle) * 0.8), a: base.a };
  },
  bomb: (px, py) => {
    const angle = Math.atan2(py, px);
    const wave = (Math.cos(10 * angle) + 1) / 2;
    const radius = 0.55 + 0.4 * wave;
    const d = Math.hypot(px, py);
    const a = shapeAlpha(d, radius);
    if (a <= 0) return null;
    const dome = clamp01(1 - d / 0.95);
    let rgb = MAROON.map((c) => c * (0.5 + 0.5 * dome));
    const ring = Math.max(0, 1 - Math.abs(d - 0.5) / 0.06);
    rgb = mixRgb(rgb, [0.1, 0, 0.05], ring * 0.4);
    const core = Math.max(0, 1 - d / 0.16);
    rgb = mixRgb(rgb, [1, 0.6, 0.25], core * 0.85);
    return { rgb, a };
  },
  shield_up: (px, py) => {
    const flower = flowerAlpha(px, py, BUD);
    const d = Math.hypot(px, py);
    const ring = clamp01((0.07 - Math.abs(d - 0.82)) / FEATHER);
    const a = Math.max(flower, ring * 0.7);
    if (a <= 0) return null;
    let rgb = flowerShade(px, py, BUD, SHIELD_GREEN, PALE_GREEN);
    rgb = mixRgb(rgb, [0.82, 1, 0.9], ring * 0.6);
    return { rgb, a };
  },
  shield_down: (px, py) => softFlower(px, py, BLOOM, TEAL, YELLOW),
  splitter: (px, py) => {
    const base = softFlower(px, py, BLOOM, ORANGE, YELLOW);
    if (base === null) return null;
    const seam = Math.max(0, 1 - Math.abs(px) / 0.04);
    return { rgb: mixRgb(base.rgb, [0.1, 0.03, 0], seam * 0.55), a: base.a };
  },
  sticky: (px, py) => {
    const main = flowerAlpha(px, py, OPENING);
    const dB1 = Math.hypot(px + 0.32, py - 0.44);
    const dB2 = Math.hypot(px - 0.36, py - 0.5);
    const a = Math.max(main, shapeAlpha(dB1, 0.22), shapeAlpha(dB2, 0.18));
    if (a <= 0) return null;
    const d = Math.hypot(px, py);
    const dome = clamp01(1 - d / 0.9);
    let rgb = STICKY.map((c) => c * (0.55 + 0.45 * dome));
    const sx = px + 0.28;
    const sy = py + 0.3;
    const spec = Math.max(0, 1 - Math.hypot(sx, sy) / 0.55);
    rgb = mixRgb(rgb, WHITE, Math.pow(spec, 2) * 0.3);
    return { rgb, a };
  },
};

const renderSprite = (shaper) => {
  const rgba = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = ((x + (sx + 0.5) / SS) / SIZE) * 2 - 1;
          const py = ((y + (sy + 0.5) / SS) / SIZE) * 2 - 1;
          const out = shaper(px, py);
          if (out === null) continue;
          r += out.rgb[0] * out.a;
          g += out.rgb[1] * out.a;
          b += out.rgb[2] * out.a;
          a += out.a;
        }
      }
      const samples = SS * SS;
      const idx = (y * SIZE + x) * 4;
      const alpha = a / samples;
      if (alpha > 0) {
        rgba[idx] = Math.round(clamp01(r / a) * 255);
        rgba[idx + 1] = Math.round(clamp01(g / a) * 255);
        rgba[idx + 2] = Math.round(clamp01(b / a) * 255);
      }
      rgba[idx + 3] = Math.round(clamp01(alpha) * 255);
    }
  }
  return encodePng(SIZE, SIZE, rgba);
};

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, shaper] of Object.entries(SHAPERS)) {
  const png = renderSprite(shaper);
  const path = resolve(OUT_DIR, `${name}.png`);
  writeFileSync(path, png);
  console.log(`wrote ${path} (${png.length} bytes)`);
}
