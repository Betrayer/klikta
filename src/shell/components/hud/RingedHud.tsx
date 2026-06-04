import { Text } from '@mantine/core';
import { useRunStore } from '../../../state/runStore';
import { ComboCounter } from '../ComboCounter';
import { TimerReadout } from '../TimerReadout';
import { UltimateBar } from '../UltimateBar';
import { HudFrame } from './HudFrame';
import { HudWave } from './HudWave';
import { PerimeterHp } from './PerimeterHp';
import { TimePulseBanner } from './TimePulseBanner';
import { useHudSpec } from './useHudSpec';

export const RingedHud = () => {
  const hud = useHudSpec();
  const score = useRunStore((s) => s.score);
  const hp = useRunStore((s) => s.hp);
  const maxHp = useRunStore((s) => s.maxHp);
  const mode = useRunStore((s) => s.mode);
  const usesTimer = mode === 'endless_timer';

  return (
    <>
      <PerimeterHp hp={hp} maxHp={maxHp} accent={hud.hp.accent} />

      <HudFrame
        frame={hud.score.frame}
        surface={hud.surface}
        pos="fixed"
        top={8}
        left={12}
      >
        <Text ff="monospace" fz="lg" fw={700} c={hud.score.accent}>
          {score}
        </Text>
      </HudFrame>

      <HudWave />

      <ComboCounter />

      <UltimateBar />

      {usesTimer && <TimerReadout />}

      <TimePulseBanner />
    </>
  );
};
