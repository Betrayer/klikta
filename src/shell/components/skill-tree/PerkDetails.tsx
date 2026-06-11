import {
  Badge,
  Box,
  Button,
  CloseButton,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  BranchId,
  SkillOption,
  TierLevel,
} from '../../../data/skillTree';
import { findPerk, findTierForPerk, tierKey } from '../../../data/skillTree';
import { useMetaStore } from '../../../state/metaStore';
import { useLocalize } from '../../../i18n/useLocalize';
import { PerkIcon } from '../icons/PerkIcon';

export interface PerkDetailsProps {
  focusedPerkId: string | null;
  onTrySelect: (
    option: SkillOption,
    branchId: BranchId,
    tier: TierLevel,
  ) => void;
  onFlashDownstream: (ids: readonly string[]) => void;
  onClose?: () => void;
}

export const PerkDetails = ({
  focusedPerkId,
  onTrySelect,
  onFlashDownstream,
  onClose,
}: PerkDetailsProps) => {
  const { t } = useTranslation();
  const loc = useLocalize();
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
    (tierItem) =>
      selectedPerks[tierKey(branch.id, tierItem.tier)] !== undefined,
  ).length;
  const tierGateMet = branchPoints >= tier.requiresPointsInBranch;

  const prevInTierId = selectedPerks[key];
  const prevCost =
    prevInTierId !== undefined && prevInTierId !== option.id
      ? (findPerk(prevInTierId)?.cost ?? 0)
      : 0;
  const effectiveCost = isSelected ? 0 : option.cost - prevCost;
  const canAfford = currency >= effectiveCost;

  const blockingDownstreamIds: string[] = (() => {
    if (!isSelected) return [];
    const ids: string[] = [];
    for (const tierItem of branch.tiers) {
      if (tierItem.tier <= tier.tier) continue;
      const sel = selectedPerks[tierKey(branch.id, tierItem.tier)];
      if (sel !== undefined) ids.push(sel);
    }
    return ids;
  })();
  const deselectBlocked = blockingDownstreamIds.length > 0;
  const highestBlockingTier = (() => {
    let max = 0;
    for (const tierItem of branch.tiers) {
      if (tierItem.tier <= tier.tier) continue;
      if (selectedPerks[tierKey(branch.id, tierItem.tier)] !== undefined) {
        max = Math.max(max, tierItem.tier);
      }
    }
    return max;
  })();

  const handleAction = () => {
    if (isSelected) {
      if (deselectBlocked) {
        onFlashDownstream(blockingDownstreamIds);
        return;
      }
      const meta = useMetaStore.getState();
      meta.awardCurrency(option.cost);
      meta.unselectPerk(key);
      return;
    }
    if (!tierGateMet || !canAfford) return;
    onTrySelect(option, branch.id, tier.tier);
  };

  const actionDisabled = isSelected ? false : !tierGateMet || !canAfford;

  const actionLabel = isSelected
    ? t('game:perk.deselect')
    : t('game:perk.select');

  const reasonText: string | null = (() => {
    if (isSelected) {
      return deselectBlocked
        ? t('game:perk.deselectTierFirst', { tier: highestBlockingTier })
        : null;
    }
    if (!tierGateMet) {
      return t('game:perk.locked', {
        points: tier.requiresPointsInBranch,
        branch: loc('perks', branch.id, 'name', branch.name),
      });
    }
    if (!canAfford) {
      return t('game:perk.needMore', { amount: effectiveCost - currency });
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
        <Stack gap="sm">
          <Group gap="sm" wrap="nowrap" align="flex-start">
            <PerkIcon name={option.icon} size={30} color={branch.color} />
            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
              <Text fw={700} fz="lg" c="white" lineClamp={2}>
                {loc('perks', option.id, 'name', option.name)}
              </Text>
              <Group gap={6} wrap="wrap">
                <Badge
                  size="xs"
                  variant="light"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${branch.color} 22%, transparent)`,
                    color: branch.color,
                  }}
                >
                  {loc('perks', branch.id, 'name', branch.name)}
                </Badge>
                <Text size="xs" c="dimmed" tt="uppercase" lts={1}>
                  {t('game:perk.tier', { tier: tier.tier })}
                </Text>
              </Group>
            </Stack>
            {onClose !== undefined && (
              <CloseButton size="sm" onClick={onClose} />
            )}
          </Group>

          <Text size="sm" c="gray.3">
            {loc('perks', option.id, 'description', option.description)}
          </Text>

          <Divider color="dark.7" />

          <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
            <Stack gap={2} style={{ minWidth: 0 }}>
              {isSelected ? (
                <Text size="md" fw={600} c={branch.color}>
                  {t('game:perk.active')}
                </Text>
              ) : (
                <>
                  <Text
                    fz="lg"
                    fw={700}
                    ff="monospace"
                    c={canAfford ? 'white' : 'red.5'}
                  >
                    {t('game:perk.cost', { cost: option.cost })}
                  </Text>
                  {prevCost > 0 && (
                    <Text size="xs" c="dimmed">
                      {t('game:perk.swapHint', {
                        refund: prevCost,
                        net: effectiveCost,
                      })}
                    </Text>
                  )}
                </>
              )}
              {reasonText !== null && (
                <Text size="xs" c="red.5">
                  {reasonText}
                </Text>
              )}
            </Stack>
            <Button
              size="md"
              color={isSelected ? 'red' : branch.color}
              variant={isSelected ? 'outline' : 'filled'}
              disabled={actionDisabled}
              onClick={handleAction}
            >
              {actionLabel}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
};
