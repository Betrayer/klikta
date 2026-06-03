import { memo, useEffect, useRef } from 'react';
import { Paper, Progress, Text } from '@mantine/core';
import { useRunStore } from '../../state/runStore';
import { audioSystem } from '../../game/systems/AudioSystem';
import {
  TIMER_INITIAL_MS,
  TIMER_LOW_WARNING_MS,
} from '../../game/config/balance';

const NORMAL_COLOR = 'highlight';
const LOW_COLOR = 'danger';

export const TimerReadout = memo(() => {
  const deciRemaining = useRunStore((s) => Math.max(0, Math.ceil(s.timeRemainingMs / 100)));
  const remainingMs = deciRemaining * 100;
  const low = remainingMs <= TIMER_LOW_WARNING_MS;
  const tickSecond = low && remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  const lastTickSecond = useRef(0);

  useEffect(() => {
    if (tickSecond === 0) {
      lastTickSecond.current = 0;
      return;
    }
    if (tickSecond === lastTickSecond.current) return;
    lastTickSecond.current = tickSecond;
    audioSystem.playTimerTick();
  }, [tickSecond]);

  const pct = Math.min(100, (remainingMs / TIMER_INITIAL_MS) * 100);
  const color = low ? LOW_COLOR : NORMAL_COLOR;

  return (
    <Paper
      pos="fixed"
      top={8}
      right={12}
      px="sm"
      py={4}
      radius="sm"
      bg="rgba(0, 0, 0, 0.4)"
      w={120}
      style={{ pointerEvents: 'none', userSelect: 'none', zIndex: 10 }}
    >
      <Text
        ff="monospace"
        fz="lg"
        fw={700}
        ta="right"
        c={color}
        style={
          low
            ? { animation: 'klikta-time-low 360ms ease-in-out infinite alternate' }
            : undefined
        }
      >
        {(remainingMs / 1000).toFixed(1)}s
      </Text>
      <Progress
        value={pct}
        color={color}
        size="sm"
        mt={4}
        transitionDuration={0}
      />
    </Paper>
  );
});
