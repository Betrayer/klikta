import { Paper, Text } from '@mantine/core';
import { useRunStore } from '../../state/runStore';
import { ComboCounter } from '../components/ComboCounter';

export const InGameHUD = () => {
  const score = useRunStore((s) => s.score);
  const hp = useRunStore((s) => s.hp);

  return (
    <>
      <Paper
        pos="fixed"
        top={8}
        left={12}
        px="sm"
        py={4}
        radius="sm"
        bg="rgba(0, 0, 0, 0.4)"
        style={{ pointerEvents: 'none', userSelect: 'none', zIndex: 10 }}
      >
        <Text ff="monospace" fz="lg" fw={700} c="#ff006e">
          {score}
        </Text>
      </Paper>

      <ComboCounter />

      <Paper
        pos="fixed"
        top={8}
        right={12}
        px="sm"
        py={4}
        radius="sm"
        bg="rgba(0, 0, 0, 0.4)"
        style={{ pointerEvents: 'none', userSelect: 'none', zIndex: 10 }}
      >
        <Text ff="monospace" fz="lg" fw={700} c="#00f5d4">
          {'♥'.repeat(hp) || '—'}
        </Text>
      </Paper>
    </>
  );
};
