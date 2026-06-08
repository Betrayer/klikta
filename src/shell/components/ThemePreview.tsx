import { useEffect, useState } from 'react';
import { Box } from '@mantine/core';
import type { Theme } from '../../data/themes/types';
import {
  areThemeAssetsLoaded,
  loadThemeAssets,
} from '../../game/assets/loadThemeAssets';
import { backgroundCss } from './themePreviewStyle';
import { ThemePreviewCanvas } from './ThemePreviewCanvas';
import { ThemeHudPreview } from './ThemeHudPreview';

const PREVIEW_HEIGHT = 120;

interface ThemePreviewProps {
  theme: Theme;
}

export const ThemePreview = ({ theme }: ThemePreviewProps) => {
  const [ready, setReady] = useState(() => areThemeAssetsLoaded(theme.id));

  useEffect(() => {
    if (areThemeAssetsLoaded(theme.id)) return;
    let cancelled = false;
    void loadThemeAssets(theme.id).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [theme.id]);

  return (
    <Box
      style={{
        position: 'relative',
        width: '100%',
        height: PREVIEW_HEIGHT,
        borderRadius: 8,
        overflow: 'hidden',
        background: backgroundCss(theme.background),
      }}
    >
      {ready && <ThemePreviewCanvas theme={theme} height={PREVIEW_HEIGHT} />}
      <ThemeHudPreview theme={theme} />
    </Box>
  );
};
