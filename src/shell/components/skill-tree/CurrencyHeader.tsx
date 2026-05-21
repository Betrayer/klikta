import { Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SKILL_TREE, tierKey } from '../../../data/skillTree';
import { useMetaStore } from '../../../state/metaStore';

const useAnimatedNumber = (target: number, durationMs: number): number => {
  const [value, setValue] = useState(target);
  const valueRef = useRef(value);
  const rafRef = useRef(0);
  const lastTargetRef = useRef(target);

  useEffect(() => {
    valueRef.current = value;
  });

  useEffect(() => {
    if (lastTargetRef.current === target) return;
    const from = valueRef.current;
    const to = target;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    lastTargetRef.current = target;
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return value;
};

export const CurrencyHeader = () => {
  const currency = useMetaStore((s) => s.currency);
  const bestScore = useMetaStore((s) => s.bestScore);
  const selectedPerks = useMetaStore((s) => s.selectedPerks);
  const animatedCurrency = useAnimatedNumber(currency, 500);

  const branchPoints = useMemo(
    () =>
      SKILL_TREE.map((b) => ({
        id: b.id,
        name: b.name,
        color: b.color,
        points: b.tiers.filter(
          (t) => selectedPerks[tierKey(b.id, t.tier)] !== undefined,
        ).length,
        total: b.tiers.length,
      })),
    [selectedPerks],
  );

  return (
    <Paper p="md" bg="#0d0118" withBorder>
      <Group justify="space-between" align="center" wrap="wrap" gap="md">
        <Stack gap={2}>
          <Text size="xs" c="dimmed" tt="uppercase">
            Currency
          </Text>
          <Title order={2} c="#ffd700" ff="monospace">
            {animatedCurrency}
          </Title>
        </Stack>

        <Group gap="lg">
          {branchPoints.map((b) => (
            <Stack key={b.id} gap={2} align="center">
              <Text size="xs" c={b.color} fw={700} tt="uppercase">
                {b.name}
              </Text>
              <Text size="sm" c="white" ff="monospace">
                {b.points}/{b.total}
              </Text>
            </Stack>
          ))}
        </Group>

        <Stack gap={2} align="flex-end">
          <Text size="xs" c="dimmed" tt="uppercase">
            Best Score
          </Text>
          <Title order={3} c="#00f5d4" ff="monospace">
            {bestScore}
          </Title>
        </Stack>
      </Group>
    </Paper>
  );
};
