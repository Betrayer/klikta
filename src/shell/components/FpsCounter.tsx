import { useEffect, useState } from 'react';
import { Paper, Text } from '@mantine/core';

interface FpsCounterProps {
  getFps: () => number;
}

export const FpsCounter = ({ getFps }: FpsCounterProps) => {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFps(Math.round(getFps()));
    }, 100);
    return () => window.clearInterval(id);
  }, [getFps]);

  return (
    <Paper
      pos="fixed"
      top={8}
      right={12}
      px="xs"
      py={2}
      radius="sm"
      bg="rgba(0, 0, 0, 0.4)"
      style={{ pointerEvents: 'none', userSelect: 'none', zIndex: 10 }}
    >
      <Text ff="monospace" fz="sm" c="#00f5d4">
        {fps} FPS
      </Text>
    </Paper>
  );
};
