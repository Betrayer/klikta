import { Box, ScrollArea } from '@mantine/core';
import type { ReactNode } from 'react';

export const MenuShell = ({ children }: { children: ReactNode }) => (
  <Box pos="relative">
    <Box
      pos="fixed"
      inset={0}
      style={{
        zIndex: 1,
        background: 'rgba(0, 0, 0, 0.35)',
        pointerEvents: 'none',
      }}
    />
    <ScrollArea
      h="100dvh"
      type="auto"
      style={{ position: 'relative', zIndex: 2 }}
    >
      {children}
    </ScrollArea>
  </Box>
);
