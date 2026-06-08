import { Text } from '@mantine/core';
import { useRunStore } from '../../../state/runStore';
import { ComboCounter } from '../ComboCounter';
import { TimerReadout } from '../TimerReadout';
import { UltimateBar } from '../UltimateBar';
import { HudFrame } from './HudFrame';
import { HudWave } from './HudWave';
import { HpDisplay } from './HpDisplay';
import { TimePulseBanner } from './TimePulseBanner';
import { useHudSpec } from './useHudSpec';

export const MinimalHud = () => {
  const hud = useHudSpec();
  const score = useRunStore((s) => s.score);
  const hp = useRunStore((s) => s.hp);
  const maxHp = useRunStore((s) => s.maxHp);
  const mode = useRunStore((s) => s.mode);
  const usesTimer = mode === 'endless_timer';

  return (
    <>
      <HudFrame frame="none" surface={hud.surface} pos="fixed" top={8} left={12}>
        <Text ff="monospace" fz="md" fw={700} c={hud.score.accent}>
          {score}
        </Text>
      </HudFrame>

      <HudWave />

      <ComboCounter />

      <UltimateBar />

      {usesTimer ? (
        <TimerReadout />
      ) : (
        <HudFrame frame="none" surface={hud.surface} pos="fixed" top={8} right={12}>
          <HpDisplay spec={hud.hp} hp={hp} maxHp={maxHp} />
        </HudFrame>
      )}

      <TimePulseBanner />
    </>
  );
};
