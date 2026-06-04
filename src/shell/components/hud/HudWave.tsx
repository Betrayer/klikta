import { Text } from '@mantine/core';
import { useCampaignStore } from '../../../state/campaignStore';
import { HudFrame } from './HudFrame';
import { useHudSpec } from './useHudSpec';

export const HudWave = () => {
  const hud = useHudSpec();
  const active = useCampaignStore((s) => s.active);
  const currentWave = useCampaignStore((s) => s.currentWave);
  const totalWaves = useCampaignStore((s) => s.totalWaves);
  if (!active) return null;

  return (
    <HudFrame
      frame="rounded"
      surface={hud.surface}
      pos="fixed"
      top={8}
      left="50%"
      style={{ transform: 'translateX(-50%)' }}
    >
      <Text ff="monospace" fz="sm" fw={700} c={hud.wave.accent} lts={1}>
        WAVE {currentWave} / {totalWaves}
      </Text>
    </HudFrame>
  );
};
