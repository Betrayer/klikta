import { Color, Texture } from "pixi.js";

const GRADIENT_TEX_WIDTH = 4;
const GRADIENT_TEX_HEIGHT = 256;

export class VerticalGradientTexture {
  readonly texture: Texture;
  private readonly ctx: CanvasRenderingContext2D;

  constructor() {
    const canvas = document.createElement("canvas");
    canvas.width = GRADIENT_TEX_WIDTH;
    canvas.height = GRADIENT_TEX_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (ctx === null) throw new Error("2D canvas context unavailable");
    this.ctx = ctx;
    this.texture = Texture.from(canvas);
  }

  paint(topColor: number, bottomColor: number): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, GRADIENT_TEX_HEIGHT);
    gradient.addColorStop(0, new Color(topColor).toHex());
    gradient.addColorStop(1, new Color(bottomColor).toHex());
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, GRADIENT_TEX_WIDTH, GRADIENT_TEX_HEIGHT);
    this.texture.source.update();
  }

  destroy(): void {
    this.texture.destroy(true);
  }
}
