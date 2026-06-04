import { Box, Group, Progress, Text } from '@mantine/core';
import type { HpVisualSpec } from '../../../data/themes/types';

interface HpDisplayProps {
  spec: HpVisualSpec;
  hp: number;
  maxHp: number;
}

const clampPct = (hp: number, maxHp: number): number =>
  maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;

export const HpDisplay = ({ spec, hp, maxHp }: HpDisplayProps) => {
  const accent = spec.accent;

  if (spec.type === 'bar') {
    return (
      <Box w={96}>
        <Text ff="monospace" fz="xs" fw={700} ta="right" c={accent}>
          {hp}/{maxHp}
        </Text>
        <Progress
          value={clampPct(hp, maxHp)}
          color={accent}
          size="sm"
          mt={2}
          transitionDuration={120}
        />
      </Box>
    );
  }

  if (spec.type === 'ring') {
    const color = `var(--mantine-color-${accent}-6)`;
    const pct = clampPct(hp, maxHp);
    return (
      <Box style={{ position: 'relative', width: 34, height: 34 }}>
        <svg width={34} height={34}>
          <circle
            cx={17}
            cy={17}
            r={14}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={3}
          />
          {pct > 0 && (
            <circle
              cx={17}
              cy={17}
              r={14}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${pct} 100`}
              transform="rotate(-90 17 17)"
              style={{ transition: 'stroke-dasharray 220ms ease-out' }}
            />
          )}
        </svg>
        <Text
          ff="monospace"
          fz={11}
          fw={700}
          c={accent}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {hp}
        </Text>
      </Box>
    );
  }

  if (spec.type === 'pips') {
    return (
      <Group gap={4}>
        {Array.from({ length: maxHp }, (_, i) => (
          <Box
            key={i}
            w={9}
            h={9}
            bg={i < hp ? accent : 'rgba(255,255,255,0.15)'}
            style={{ borderRadius: '50%' }}
          />
        ))}
      </Group>
    );
  }

  return (
    <Text ff="monospace" fz="lg" fw={700} c={accent}>
      {'♥'.repeat(hp) || '-'}
    </Text>
  );
};
