import { Badge, Box, Button, Group, Paper, Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import type {
  BranchId,
  SkillOption,
  TierLevel,
} from '../../../data/skillTree';
import { findPerk, findTierForPerk, tierKey } from '../../../data/skillTree';
import { useMetaStore } from '../../../state/metaStore';
import { PerkIcon } from '../icons/PerkIcon';

export interface PerkDetailsProps {
  focusedPerkId: string | null;
  onTrySelect: (
    option: SkillOption,
    branchId: BranchId,
    tier: TierLevel,
  ) => void;
}

export const PerkDetails = ({ focusedPerkId, onTrySelect }: PerkDetailsProps) => {
  const selectedPerks = useMetaStore((s) => s.selectedPerks);
  const currency = useMetaStore((s) => s.currency);

  const option = focusedPerkId ? findPerk(focusedPerkId) : undefined;
  const tierEntry = useMemo(
    () => (option ? findTierForPerk(option.id) : undefined),
    [option],
  );

  if (option === undefined || tierEntry === undefined) {
    return null;
  }

  const { branch, tier } = tierEntry;
  const key = tierKey(branch.id, tier.tier);
  const isSelected = selectedPerks[key] === option.id;

  const branchPoints = branch.tiers.filter(
    (t) => selectedPerks[tierKey(branch.id, t.tier)] !== undefined,
  ).length;
  const tierGateMet = branchPoints >= tier.requiresPointsInBranch;

  const prevInTierId = selectedPerks[key];
  const prevCost =
    prevInTierId !== undefined && prevInTierId !== option.id
      ? (findPerk(prevInTierId)?.cost ?? 0)
      : 0;
  const effectiveCost = isSelected ? 0 : option.cost - prevCost;
  const canAfford = currency >= effectiveCost;

  const deselectBlockReason: string | null = (() => {
    if (!isSelected) return null;
    const afterPoints = branchPoints - 1;
    for (const t of branch.tiers) {
      if (t.tier <= tier.tier) continue;
      const stillSelected = selectedPerks[tierKey(branch.id, t.tier)];
      if (
        stillSelected !== undefined &&
        afterPoints < t.requiresPointsInBranch
      ) {
        return `Deselect Tier ${t.tier} first.`;
      }
    }
    return null;
  })();

  const handleAction = () => {
    if (isSelected) {
      if (deselectBlockReason !== null) return;
      const meta = useMetaStore.getState();
      meta.awardCurrency(option.cost);
      meta.unselectPerk(key);
      return;
    }
    if (!tierGateMet || !canAfford) return;
    onTrySelect(option, branch.id, tier.tier);
  };

  const swapHint =
    !isSelected && prevCost > 0
      ? ` (refund ${prevCost}, net ${effectiveCost})`
      : '';

  const actionDisabled = isSelected
    ? deselectBlockReason !== null
    : !tierGateMet || !canAfford;

  const actionLabel = isSelected ? 'Deselect (refund)' : 'Select';

  const reasonText: string | null = (() => {
    if (isSelected) return deselectBlockReason;
    if (!tierGateMet) {
      return `Locked - need ${tier.requiresPointsInBranch} pts in ${branch.name}.`;
    }
    if (!canAfford) {
      return `Need ${effectiveCost - currency} more.`;
    }
    return null;
  })();

  return (
    <Box
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(560px, calc(100% - 24px))',
        zIndex: 20,
      }}
    >
      <Paper
        p="md"
        radius="md"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--mantine-color-surface-filled) 88%, transparent)',
          backdropFilter: 'blur(8px)',
          border: `1px solid color-mix(in srgb, ${branch.color} 55%, transparent)`,
          boxShadow: `0 8px 28px rgba(0, 0, 0, 0.45), 0 0 18px color-mix(in srgb, ${branch.color} 22%, transparent)`,
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
          <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
            <Group gap="sm" wrap="nowrap">
              <PerkIcon name={option.icon} size={30} color={branch.color} />
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text fw={700} fz="lg" c="white" lineClamp={1}>
                  {option.name}
                </Text>
                <Group gap={6} wrap="nowrap">
                  <Badge
                    size="xs"
                    variant="light"
                    style={{ backgroundColor: `color-mix(in srgb, ${branch.color} 22%, transparent)`, color: branch.color }}
                  >
                    {branch.name}
                  </Badge>
                  <Text size="xs" c="dimmed" tt="uppercase" lts={1}>
                    Tier {tier.tier}
                  </Text>
                </Group>
              </Stack>
            </Group>
            <Text size="sm" c="gray.3">
              {option.description}
            </Text>
          </Stack>

          <Stack gap={6} align="flex-end" miw={150}>
            {isSelected ? (
              <Text size="sm" c={branch.color} fw={600}>
                Active
              </Text>
            ) : (
              <Text size="sm" c={canAfford ? 'gray.3' : 'red.5'} ff="monospace">
                Cost {option.cost}
                {swapHint}
              </Text>
            )}
            {reasonText !== null && (
              <Text size="xs" c="red.5" ta="right">
                {reasonText}
              </Text>
            )}
            <Button
              size="sm"
              color={isSelected ? 'red' : branch.color}
              variant={isSelected ? 'outline' : 'filled'}
              disabled={actionDisabled}
              onClick={handleAction}
            >
              {actionLabel}
            </Button>
          </Stack>
        </Group>
      </Paper>
    </Box>
  );
};
