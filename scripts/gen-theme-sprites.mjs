import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "../src/assets/themes/aurora");
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

const normalize3 = (v) => {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
};

const LIGHT = normalize3([-0.45, -0.6, 0.66]);
const HALF = normalize3([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);
const WHITE = [1, 1, 1];
const FEATHER = 0.04;

const orbShade = (px, py, sphereR) => {
  const nx = px / sphereR;
  const ny = py / sphereR;
  const nz2 = 1 - nx * nx - ny * ny;
  const nz = nz2 > 0 ? Math.sqrt(nz2) : 0;
  const diffuse = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
  const ambient = 0.34;
  const lightAmt = ambient + (1 - ambient) * diffuse;
  const ndoth = Math.max(0, nx * HALF[0] + ny * HALF[1] + nz * HALF[2]);
  const spec = Math.pow(ndoth, 44) * 0.9;
  const rim = Math.pow(1 - nz, 3) * 0.16;
  return { lightAmt, spec, rim, nz };
};

const shapeAlpha = (d, radius) => clamp01((radius - d) / FEATHER);

const SHAPERS = {
  regular: (px, py, color) => {
    const d = Math.hypot(px, py);
    const a = shapeAlpha(d, 0.9);
    if (a <= 0) return null;
    const s = orbShade(px, py, 0.9);
    let rgb = color.map((c) => c * s.lightAmt);
    rgb = mixRgb(rgb, WHITE, s.spec);
    rgb = mixRgb(rgb, mixRgb(color, WHITE, 0.6), s.rim);
    return { rgb, a };
  },
  golden: (px, py, color) => {
    const d = Math.hypot(px, py);
    const a = shapeAlpha(d, 0.9);
    if (a <= 0) return null;
    const s = orbShade(px, py, 0.9);
    let rgb = color.map((c) => c * s.lightAmt);
    rgb = mixRgb(rgb, WHITE, s.spec);
    rgb = mixRgb(rgb, mixRgb(color, WHITE, 0.6), s.rim);
    const gx = px + 0.32;
    const gy = py + 0.34;
    const gd = Math.hypot(gx, gy);
    const cross = Math.max(
      Math.max(0, 1 - Math.abs(gx) / 0.03) *
        Math.max(0, 1 - Math.abs(gy) / 0.34),
      Math.max(0, 1 - Math.abs(gy) / 0.03) *
        Math.max(0, 1 - Math.abs(gx) / 0.34),
    );
    const sparkle = Math.max(Math.pow(Math.max(0, 1 - gd / 0.3), 2), cross);
    rgb = mixRgb(rgb, WHITE, clamp01(sparkle) * 0.85);
    return { rgb, a };
  },
  bomb: (px, py, color) => {
    const angle = Math.atan2(py, px);
    const spikes = 11;
    const wave = (Math.cos(spikes * angle) + 1) / 2;
    const radius = 0.5 + 0.42 * wave;
    const d = Math.hypot(px, py);
    const a = shapeAlpha(d, radius);
    if (a <= 0) return null;
    const s = orbShade(px, py, 0.84);
    let rgb = color.map((c) => c * s.lightAmt);
    rgb = mixRgb(rgb, WHITE, s.spec);
    const ring = Math.max(0, 1 - Math.abs(d - 0.46) / 0.06);
    rgb = mixRgb(rgb, [0.05, 0.0, 0.05], ring * 0.45);
    const core = Math.max(0, 1 - d / 0.14);
    rgb = mixRgb(rgb, [1, 0.93, 0.7], core * 0.8);
    return { rgb, a };
  },
  multi: (px, py, color) => {
    const d = Math.hypot(px, py);
    const a = shapeAlpha(d, 0.9);
    if (a <= 0) return null;
    const s = orbShade(px, py, 0.9);
    let rgb = color.map((c) => c * s.lightAmt);
    rgb = mixRgb(rgb, WHITE, s.spec);
    rgb = mixRgb(rgb, mixRgb(color, WHITE, 0.6), s.rim);
    const ringA = Math.max(0, 1 - Math.abs(d - 0.43) / 0.035);
    const ringB = Math.max(0, 1 - Math.abs(d - 0.66) / 0.035);
    rgb = mixRgb(
      rgb,
      mixRgb(color, [0, 0, 0], 0.5),
      Math.max(ringA, ringB) * 0.5,
    );
    return { rgb, a };
  },
  shielded: (px, py, color) => {
    const d = Math.hypot(px, py);
    const a = shapeAlpha(d, 0.9);
    if (a <= 0) return null;
    const s = orbShade(px, py, 0.9);
    let rgb = color.map((c) => c * s.lightAmt);
    rgb = mixRgb(rgb, WHITE, s.spec);
    rgb = mixRgb(rgb, mixRgb(color, WHITE, 0.6), s.rim);
    const shell = Math.max(0, 1 - Math.abs(d - 0.8) / 0.06);
    rgb = mixRgb(rgb, mixRgb(color, WHITE, 0.7), shell * 0.55);
    return { rgb, a };
  },
  splitter: (px, py, color) => {
    const d = Math.hypot(px, py);
    const a = shapeAlpha(d, 0.9);
    if (a <= 0) return null;
    const s = orbShade(px, py, 0.9);
    let rgb = color.map((c) => c * s.lightAmt);
    rgb = mixRgb(rgb, WHITE, s.spec);
    rgb = mixRgb(rgb, mixRgb(color, WHITE, 0.6), s.rim);
    const seam = Math.max(0, 1 - Math.abs(px) / 0.035);
    rgb = mixRgb(rgb, [0, 0, 0], seam * 0.5);
    const lip = Math.max(0, 1 - Math.abs(px - 0.06) / 0.03);
    rgb = mixRgb(rgb, mixRgb(color, WHITE, 0.7), lip * 0.4);
    return { rgb, a };
  },
  sticky: (px, py, color) => {
    const dMain = Math.hypot(px, py);
    const dB1 = Math.hypot(px + 0.3, py - 0.46);
    const dB2 = Math.hypot(px - 0.34, py - 0.52);
    const a = Math.max(
      shapeAlpha(dMain, 0.82),
      shapeAlpha(dB1, 0.3),
      shapeAlpha(dB2, 0.26),
    );
    if (a <= 0) return null;
    const s = orbShade(px, py, 0.82);
    let rgb = color.map((c) => c * (0.55 + 0.45 * s.lightAmt));
    rgb = mixRgb(rgb, WHITE, s.spec * 1.2);
    rgb = mixRgb(rgb, mixRgb(color, WHITE, 0.6), s.rim);
    return { rgb, a };
  },
};

const TARGETS = {
  regular: 0x4ade80,
  golden: 0xffd24a,
  bomb: 0xff4d6d,
  multi: 0x60a5fa,
  shielded: 0xa78bfa,
  splitter: 0xfb923c,
  sticky: 0x22d3ee,
};

const renderSprite = (kind, hex) => {
  const color = hexRgb(hex);
  const shaper = SHAPERS[kind];
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
          const out = shaper(px, py, color);
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
for (const [kind, hex] of Object.entries(TARGETS)) {
  const png = renderSprite(kind, hex);
  const path = resolve(OUT_DIR, `${kind}.png`);
  writeFileSync(path, png);
  console.log(`wrote ${path} (${png.length} bytes)`);
}
