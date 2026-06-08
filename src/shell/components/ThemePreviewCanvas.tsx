import { useEffect, useRef } from 'react';
import { Box } from '@mantine/core';
import { Application, Container } from 'pixi.js';
import type { Theme } from '../../data/themes/types';
import type { TargetKind } from '../../data/targetConfig';
import { BackgroundLayer } from '../../game/background/BackgroundLayer';
import { rendererFor } from '../../game/entities/render/TargetRenderer';

const PREVIEW_TARGETS: TargetKind[] = [
  'regular',
  'golden',
  'multi',
  'shielded',
  'bomb',
];
const TARGET_SIZE = 15;

interface ThemePreviewCanvasProps {
  theme: Theme;
  height: number;
}

export const ThemePreviewCanvas = ({
  theme,
  height,
}: ThemePreviewCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el === null) return;

    const app = new Application();
    let disposed = false;
    let bg: BackgroundLayer | null = null;
    let row: Container | null = null;

    const layout = (): void => {
      const w = app.renderer.screen.width;
      const h = app.renderer.screen.height;
      if (bg !== null) bg.resize(w, h);
      if (row !== null) {
        const gap = w / (row.children.length + 1);
        row.children.forEach((child, index) => {
          child.x = gap * (index + 1);
          child.y = h / 2;
        });
      }
    };

    app
      .init({
        resizeTo: el,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
        preference: 'webgl',
      })
      .then(
        () => {
          if (disposed) {
            app.destroy(true, { children: true, texture: false });
            return;
          }
          el.appendChild(app.canvas);
          bg = new BackgroundLayer(theme.background, {
            w: app.renderer.screen.width,
            h: app.renderer.screen.height,
          });
          app.stage.addChild(bg.view);
          bg.update(0);
          row = new Container();
          for (const kind of PREVIEW_TARGETS) {
            const visual = theme.targets[kind];
            row.addChild(rendererFor(visual.mode).build(visual, TARGET_SIZE));
          }
          app.stage.addChild(row);
          layout();
          app.renderer.on('resize', layout);
        },
        (err: unknown) => {
          console.error('ThemePreviewCanvas init failed', err);
        },
      );

    return () => {
      disposed = true;
      if (bg === null) return;
      app.renderer.off('resize', layout);
      app.stage.removeChild(bg.view);
      bg.destroy();
      bg = null;
      row = null;
      app.destroy(true, { children: true, texture: false });
    };
  }, [theme, height]);

  return <Box ref={containerRef} style={{ width: '100%', height }} />;
};
