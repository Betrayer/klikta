import { Group, Paper, Stack, Text } from '@mantine/core';
import { memo } from 'react';
import type { BranchId, SkillOption, TierLevel } from '../../../data/skillTree';

export interface PerkButtonProps {
  option: SkillOption;
  branchId: BranchId;
  branchColor: string;
  tier: TierLevel;
  tierGateMet: boolean;
  tierRequiredPoints: number;
  isSelected: boolean;
  isFocused: boolean;
  isPinned: boolean;
  canAffordEffective: boolean;
  onHover: (id: string | null) => void;
  onPin: (id: string) => void;
  onTrySelect: (
    option: SkillOption,
    branchId: BranchId,
    tier: TierLevel,
  ) => void;
}

const PerkButtonImpl = ({
  option,
  branchId,
  branchColor,
  tier,
  tierGateMet,
  tierRequiredPoints,
  isSelected,
  isFocused,
  isPinned,
  canAffordEffective,
  onHover,
  onPin,
  onTrySelect,
}: PerkButtonProps) => {
  const isLocked = !tierGateMet && !isSelected;
  const isUnaffordable = !isLocked && !isSelected && !canAffordEffective;

  const opacity = isLocked ? 0.4 : isUnaffordable ? 0.65 : 1;
  const filter = isLocked ? 'grayscale(0.85)' : 'none';
  const border = isSelected
    ? `2px solid ${branchColor}`
    : isPinned
      ? `2px solid color-mix(in srgb, ${branchColor} 80%, transparent)`
      : isFocused
        ? `1px solid color-mix(in srgb, ${branchColor} 70%, transparent)`
        : '1px solid color-mix(in srgb, white 10%, transparent)';
  const boxShadow = isSelected
    ? `0 0 14px color-mix(in srgb, ${branchColor} 70%, transparent)`
    : 'none';
  const transform =
    isFocused && !isLocked && !isSelected ? 'scale(1.02)' : 'scale(1)';
  const cursor = 'pointer';

  const statusText = isSelected
    ? 'Selected'
    : isLocked
      ? `Need ${tierRequiredPoints} pts`
      : `${option.cost}`;

  const handleClick = () => {
    onPin(option.id);
    if (isSelected || isLocked || isUnaffordable) return;
    onTrySelect(option, branchId, tier);
  };

  return (
    <Paper
      p="xs"
      bg="surface"
      onClick={handleClick}
      onMouseEnter={() => onHover(option.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        cursor,
        opacity,
        filter,
        border,
        boxShadow,
        transform,
        transition:
          'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
      }}
    >
      <Group gap="xs" wrap="nowrap" align="flex-start">
        <Text fz="xl" lh={1}>
          {isLocked ? '🔒' : option.icon}
        </Text>
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={600} c="white" lineClamp={1}>
            {option.name}
          </Text>
          <Text
            size="xs"
            c={
              isSelected
                ? branchColor
                : isUnaffordable
                  ? 'red.5'
                  : 'dimmed'
            }
            ff="monospace"
          >
            {statusText}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
};

export const PerkButton = memo(PerkButtonImpl);
