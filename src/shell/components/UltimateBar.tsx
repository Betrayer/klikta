import { memo, useMemo } from 'react';
import { Box, Paper, Progress, Text, UnstyledButton } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRunStore } from '../../state/runStore';
import { findUltimateSlot, type BranchId } from '../../data/skillTree';
import { requestUltimateActivation } from '../../game/systems/ultimateActivation';
import { useLocalize } from '../../i18n/useLocalize';
import { useHudSpec } from './hud/useHudSpec';

interface UltimateSlot {
  hotkey: number;
  ultimateId: string;
  ultimateName: string;
  perkId: string;
  branchId: BranchId;
  color: string;
}

export const UltimateBar = memo(() => {
  const charges = useRunStore((s) => s.ultimateCharges);
  const activeUltimate = useRunStore((s) => s.activeUltimate);
  const surface = useHudSpec().ultimate.surface;

  const slots = useMemo<UltimateSlot[]>(() => {
    const out: UltimateSlot[] = [];
    for (const ultimateId of Object.keys(charges)) {
      const info = findUltimateSlot(ultimateId);
      if (info === undefined) continue;
      out.push({
        hotkey: info.branchIndex + 1,
        ultimateId,
        ultimateName: info.name,
        perkId: info.perkId,
        branchId: info.branchId,
        color: info.color,
      });
    }
    out.sort((a, b) => a.hotkey - b.hotkey);
    return out;
  }, [charges]);

  if (slots.length === 0) return null;

  const someoneBlocking = activeUltimate !== null;

  return (
    <Box
      pos="fixed"
      bottom={20}
      left="50%"
      style={{
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        gap: 'clamp(4px, 1.5vw, 8px)',
        maxWidth: '100vw',
        padding: '0 8px',
      }}
    >
      {slots.map((slot) => (
        <UltimateCard
          key={slot.ultimateId}
          slot={slot}
          charge={charges[slot.ultimateId] ?? 0}
          isActive={activeUltimate === slot.ultimateId}
          isBlocked={someoneBlocking && activeUltimate !== slot.ultimateId}
          surface={surface}
        />
      ))}
    </Box>
  );
});

interface UltimateCardProps {
  slot: UltimateSlot;
  charge: number;
  isActive: boolean;
  isBlocked: boolean;
  surface: string;
}

const UltimateCard = ({
  slot,
  charge,
  isActive,
  isBlocked,
  surface,
}: UltimateCardProps) => {
  const { t } = useTranslation();
  const loc = useLocalize();
  const ready = charge >= 100 && !isActive && !isBlocked;
  const canClick = ready;
  const dim = isBlocked && !isActive;

  const handleClick = (): void => {
    if (!canClick) return;
    requestUltimateActivation(slot.ultimateId);
  };

  return (
    <UnstyledButton
      onClick={handleClick}
      disabled={!canClick}
      style={{
        pointerEvents: canClick ? 'auto' : 'none',
      }}
    >
      <Paper
        px="sm"
        py="xs"
        radius="md"
        bg={surface}
        style={{
          width: 'clamp(64px, 18vw, 96px)',
          border: `1px solid ${isActive ? slot.color : 'rgba(255,255,255,0.08)'}`,
          boxShadow: ready
            ? `0 0 16px ${slot.color}`
            : isActive
              ? `0 0 24px ${slot.color}`
              : 'none',
          opacity: dim ? 0.4 : 1,
          transition: 'box-shadow 200ms ease-out, opacity 200ms ease-out',
          userSelect: 'none',
        }}
      >
        <Box
          mb={4}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <Text
            ff="monospace"
            fz="xs"
            fw={900}
            c={slot.color}
            style={{ letterSpacing: 1 }}
          >
            {slot.hotkey}
          </Text>
          <Text
            ff="monospace"
            fz={9}
            c={slot.color}
            style={{ letterSpacing: 1 }}
          >
            {isActive ? t('game:hud.active') : `${Math.floor(charge)}%`}
          </Text>
        </Box>
        <Progress
          value={isActive ? 100 : charge}
          color={slot.color}
          size="sm"
          radius="xl"
          transitionDuration={120}
          striped={isActive}
          animated={isActive}
        />
        <Text
          ff="monospace"
          fz={9}
          ta="center"
          mt={4}
          c={ready ? slot.color : 'gray.5'}
          style={{
            letterSpacing: 1,
            animation: ready
              ? 'klikta-pulse-warn 220ms ease-in-out infinite alternate'
              : 'none',
          }}
        >
          {loc('perks', slot.perkId, 'name', slot.ultimateName).toUpperCase()}
        </Text>
      </Paper>
    </UnstyledButton>
  );
};
