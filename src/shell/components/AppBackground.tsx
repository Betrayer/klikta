import { useEffect, useRef } from 'react';
import { Box } from '@mantine/core';
import { Application } from 'pixi.js';
import { BackgroundLayer } from '../../game/background/BackgroundLayer';
import { getBackgroundSpec } from '../../state/themeSelectors';
import { useMetaStore } from '../../state/metaStore';
import { useSettingsStore } from '../../state/settingsStore';

export const AppBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el === null) return;

    const app = new Application();
    let disposed = false;
    let bg: BackgroundLayer | null = null;
    let unsubscribeTheme: (() => void) | null = null;

    const tick = (): void => {
      if (bg !== null) bg.update(app.ticker.deltaMS);
    };

    const handleResize = (): void => {
      if (bg === null) return;
      const { width, height } = app.renderer.screen;
      bg.resize(width, height);
    };

    app
      .init({
        resizeTo: el,
        backgroundAlpha: 0,
        antialias: false,
        autoDensity: true,
        resolution: 1,
        preference: 'webgl',
      })
      .then(
        () => {
          if (disposed) {
            app.destroy(true, { children: true, texture: true });
            return;
          }
          el.appendChild(app.canvas);
          bg = new BackgroundLayer(getBackgroundSpec(), {
            w: app.renderer.screen.width,
            h: app.renderer.screen.height,
          });
          app.stage.addChild(bg.view);
          bg.update(0);
          app.renderer.on('resize', handleResize);
          if (!useSettingsStore.getState().reduceMotion) {
            app.ticker.add(tick);
          }
          unsubscribeTheme = useMetaStore.subscribe((state, prev) => {
            if (state.activeThemeId !== prev.activeThemeId && bg !== null) {
              bg.applySpec(getBackgroundSpec());
            }
          });
        },
        (err: unknown) => {
          console.error('AppBackground init failed', err);
        },
      );

    return () => {
      disposed = true;
      unsubscribeTheme?.();
      if (bg === null) return;
      app.ticker.remove(tick);
      app.renderer.off('resize', handleResize);
      app.stage.removeChild(bg.view);
      bg.destroy();
      bg = null;
      app.destroy(true, { children: true, texture: true });
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      pos="fixed"
      inset={0}
      style={{ zIndex: 0, pointerEvents: 'none' }}
    />
  );
};
