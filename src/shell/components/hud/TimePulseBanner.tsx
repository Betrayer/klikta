import { Paper, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRunStore } from '../../../state/runStore';

export const TimePulseBanner = () => {
  const { t } = useTranslation();
  const incoming = useRunStore((s) => s.timePulseIncoming);
  if (!incoming) return null;

  return (
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
        {t('game:hud.timePulse')}
      </Text>
    </Paper>
  );
};
