import { Box, Text } from '@mantine/core';
import { useMetaStore } from '../../state/metaStore';
import type { ScoreFrameStyle, Theme } from '../../data/themes/types';

const FRAME_RADIUS: Record<ScoreFrameStyle, number> = {
  rounded: 4,
  sharp: 0,
  pill: 999,
  none: 4,
};

interface ThemeHudPreviewProps {
  theme: Theme;
}

export const ThemeHudPreview = ({ theme }: ThemeHudPreviewProps) => {
  const style = useMetaStore((s) => s.activeHudStyle);
  const hud = theme.hud;
  const minimal = style === 'minimal';
  const ringed = style === 'ringed';
  const scoreColor = theme.ui[hud.score.accent];
  const hpColor = theme.ui[hud.hp.accent];
  const chipBg = minimal ? 'transparent' : hud.surface;
  const pad = minimal ? 0 : '1px 5px';

  return (
    <Box style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {ringed && (
        <Box
          style={{
            position: 'absolute',
            inset: 5,
            border: `2px solid ${hpColor}`,
            borderRadius: 8,
            opacity: 0.55,
          }}
        />
      )}

      <Box
        style={{
          position: 'absolute',
          top: 6,
          left: 7,
          padding: pad,
          background: chipBg,
          borderRadius: FRAME_RADIUS[hud.score.frame],
        }}
      >
        <Text ff="monospace" fw={700} fz={minimal ? 10 : 12} style={{ color: scoreColor }}>
          1280
        </Text>
      </Box>

      {!ringed && (
        <Box
          style={{
            position: 'absolute',
            top: 6,
            right: 7,
            padding: pad,
            background: chipBg,
            borderRadius: 4,
          }}
        >
          <Text ff="monospace" fz={11} style={{ color: hpColor }}>
            ♥♥♥
          </Text>
        </Box>
      )}
    </Box>
  );
};
