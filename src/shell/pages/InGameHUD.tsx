import { Paper, Text } from '@mantine/core';
import { useRunStore } from '../../state/runStore';
import { ComboCounter } from '../components/ComboCounter';
import { TimerReadout } from '../components/TimerReadout';
import { UltimateBar } from '../components/UltimateBar';

export const InGameHUD = () => {
  const score = useRunStore((s) => s.score);
  const hp = useRunStore((s) => s.hp);
  const mode = useRunStore((s) => s.mode);
  const timePulseIncoming = useRunStore((s) => s.timePulseIncoming);
  const usesTimer = mode === 'endless_timer';

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

      <UltimateBar />

      {usesTimer ? (
        <TimerReadout />
      ) : (
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
            {'♥'.repeat(hp) || '-'}
          </Text>
        </Paper>
      )}

      {timePulseIncoming && (
        <Paper
          pos="fixed"
          top="38%"
          left="50%"
          px="lg"
          py="xs"
          radius="md"
          bg="rgba(157, 78, 221, 0.85)"
          style={{
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 11,
            animation: 'klikta-pulse-warn 200ms ease-in-out infinite alternate',
            boxShadow: '0 0 24px rgba(157, 78, 221, 0.7)',
          }}
        >
          <Text ff="monospace" fz="xl" fw={900} c="white" lts={4}>
            ⏱ TIME PULSE
          </Text>
        </Paper>
      )}
    </>
  );
};
