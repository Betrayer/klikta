import { Box } from '@mantine/core';
import type { ReactNode } from 'react';
import { MenuBackgroundLayer } from './MenuBackgroundLayer';

export const MenuShell = ({ children }: { children: ReactNode }) => (
  <Box pos="relative" mih="100vh" style={{ overflow: 'hidden' }}>
    <MenuBackgroundLayer />
    <Box
      pos="absolute"
      inset={0}
      style={{
        zIndex: 1,
        background: 'rgba(0, 0, 0, 0.35)',
        pointerEvents: 'none',
      }}
    />
    <Box pos="relative" style={{ zIndex: 2, minHeight: '100vh' }}>
      {children}
    </Box>
  </Box>
);
