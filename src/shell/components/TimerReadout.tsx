import { useEffect, useRef } from 'react';
import { Paper, Progress, Text } from '@mantine/core';
import { useRunStore } from '../../state/runStore';
import { audioSystem } from '../../game/systems/AudioSystem';
import {
  TIMER_INITIAL_MS,
  TIMER_LOW_WARNING_MS,
} from '../../game/config/balance';

const NORMAL_COLOR = '#00f5d4';
const LOW_COLOR = '#ff2d55';

export const TimerReadout = () => {
  const timeRemainingMs = useRunStore((s) => s.timeRemainingMs);
  const low = timeRemainingMs <= TIMER_LOW_WARNING_MS;
  const tickSecond =
    low && timeRemainingMs > 0 ? Math.ceil(timeRemainingMs / 1000) : 0;
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

  const pct = Math.min(100, (timeRemainingMs / TIMER_INITIAL_MS) * 100);
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
        {(Math.max(0, timeRemainingMs) / 1000).toFixed(1)}s
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
};
