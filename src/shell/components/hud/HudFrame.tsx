import { Paper, type PaperProps } from '@mantine/core';
import type { CSSProperties, ReactNode } from 'react';
import type { ScoreFrameStyle } from '../../../data/themes/types';

const FRAME_RADIUS: Record<ScoreFrameStyle, PaperProps['radius']> = {
  rounded: 'sm',
  sharp: 0,
  pill: 'xl',
  none: 'sm',
};

interface HudFrameProps extends PaperProps {
  frame: ScoreFrameStyle;
  surface: string;
  children: ReactNode;
  style?: CSSProperties;
}

export const HudFrame = ({
  frame,
  surface,
  children,
  style,
  ...rest
}: HudFrameProps) => (
  <Paper
    px="sm"
    py={4}
    radius={FRAME_RADIUS[frame]}
    bg={frame === 'none' ? 'transparent' : surface}
    style={{ pointerEvents: 'none', userSelect: 'none', zIndex: 10, ...style }}
    {...rest}
  >
    {children}
  </Paper>
);
