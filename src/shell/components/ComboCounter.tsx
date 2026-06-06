import { memo, useEffect, useRef, useState } from 'react';
import { Box, Text } from '@mantine/core';
import { useRunStore } from '../../state/runStore';
import { useHudSpec } from './hud/useHudSpec';

export const ComboCounter = memo(() => {
  const combo = useRunStore((s) => s.combo);
  const { accent, bumpScale } = useHudSpec().combo;
  const [bump, setBump] = useState(false);
  const prev = useRef(0);

  useEffect(() => {
    if (combo > prev.current) {
      setBump(true);
      const id = window.setTimeout(() => setBump(false), 120);
      prev.current = combo;
      return () => window.clearTimeout(id);
    }
    prev.current = combo;
    return undefined;
  }, [combo]);

  if (combo <= 0) return null;

  return (
    <Box
      pos="fixed"
      top={10}
      left="50%"
      style={{
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 10,
      }}
    >
      <Text
        ff="monospace"
        fw={900}
        c={accent}
        style={{
          display: 'inline-block',
          fontSize: 'clamp(1.375rem, 6vw, 2.125rem)',
          transform: bump ? `scale(${bumpScale})` : 'scale(1)',
          transition: 'transform 110ms ease-out',
        }}
      >
        ×{combo}
      </Text>
    </Box>
  );
});
