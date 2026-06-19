import { useEffect, useRef } from 'react';
import { Box } from '@mantine/core';
import { Application } from 'pixi.js';
import { BackgroundLayer } from '../../game/background/BackgroundLayer';
import { themeTextureSrc } from '../../game/assets/AssetManifest';
import { getActiveTheme } from '../../state/themeSelectors';
import { useMetaStore } from '../../state/metaStore';
import { useSettingsStore } from '../../state/settingsStore';

const SOLID_FALLBACK = 0x101018;

export const AppBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el === null) return;

    const app = new Application();
    let disposed = false;
    let bg: BackgroundLayer | null = null;
    let bgAttached = false;
    let unsubscribeTheme: (() => void) | null = null;

    const tick = (): void => {
      if (bg !== null && bgAttached) bg.update(app.ticker.deltaMS);
    };

    const handleResize = (): void => {
      if (bg === null) return;
      const { width, height } = app.renderer.screen;
      bg.resize(width, height);
    };

    const applyTheme = (): void => {
      if (disposed || bg === null) return;
      const theme = getActiveTheme();
      const spec = theme.background;
      if (spec.kind === 'image') {
        const src =
          spec.texture !== undefined
            ? themeTextureSrc(theme.id, spec.texture)
            : undefined;
        el.style.backgroundImage = src !== undefined ? `url("${src}")` : 'none';
        if (bgAttached) {
          app.stage.removeChild(bg.view);
          bgAttached = false;
        }
      } else {
        el.style.backgroundImage = 'none';
        bg.applySpec(spec);
        if (!bgAttached) {
          app.stage.addChild(bg.view);
          bgAttached = true;
        }
      }
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
            app.destroy(true, { children: true, texture: false });
            return;
          }
          el.appendChild(app.canvas);
          bg = new BackgroundLayer(
            { kind: 'solid', color: SOLID_FALLBACK },
            { w: app.renderer.screen.width, h: app.renderer.screen.height },
          );
          app.renderer.on('resize', handleResize);
          if (!useSettingsStore.getState().reduceMotion) {
            app.ticker.add(tick);
          }
          applyTheme();
          unsubscribeTheme = useMetaStore.subscribe((state, prev) => {
            if (state.activeThemeId !== prev.activeThemeId) applyTheme();
          });
        },
        (err: unknown) => {
          console.error('AppBackground init failed', err);
        },
      );

    return () => {
      disposed = true;
      unsubscribeTheme?.();
      el.style.backgroundImage = 'none';
      if (bg === null) return;
      app.ticker.remove(tick);
      app.renderer.off('resize', handleResize);
      if (bgAttached) app.stage.removeChild(bg.view);
      bg.destroy();
      bg = null;
      app.destroy(true, { children: true, texture: false });
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      pos="fixed"
      inset={0}
      style={{
        zIndex: 0,
        pointerEvents: 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  );
};
