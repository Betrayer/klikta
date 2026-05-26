import { Paper, Stack, Text, Title } from '@mantine/core';
import { useMemo } from 'react';
import type {
  BranchId,
  SkillBranch,
  SkillOption,
  TierLevel,
} from '../../../data/skillTree';
import { findPerk, tierKey } from '../../../data/skillTree';
import { useMetaStore } from '../../../state/metaStore';
import { PerkButton } from './PerkButton';

export interface BranchColumnProps {
  branch: SkillBranch;
  focusedPerkId: string | null;
  pinnedPerkId: string | null;
  onHover: (id: string | null) => void;
  onPin: (id: string) => void;
  onTrySelect: (
    option: SkillOption,
    branchId: BranchId,
    tier: TierLevel,
  ) => void;
}

export const BranchColumn = ({
  branch,
  focusedPerkId,
  pinnedPerkId,
  onHover,
  onPin,
  onTrySelect,
}: BranchColumnProps) => {
  const selectedPerks = useMetaStore((s) => s.selectedPerks);
  const currency = useMetaStore((s) => s.currency);

  const branchPoints = useMemo(
    () =>
      branch.tiers.filter(
        (t) => selectedPerks[tierKey(branch.id, t.tier)] !== undefined,
      ).length,
    [branch, selectedPerks],
  );

  return (
    <Paper
      p="sm"
      withBorder
      style={{
        backgroundColor: `color-mix(in srgb, ${branch.color} 8%, var(--mantine-color-background-filled))`,
        borderColor: `color-mix(in srgb, ${branch.color} 35%, transparent)`,
      }}
    >
      <Stack gap="sm">
        <Stack gap={2}>
          <Title order={3} fz="md" c={branch.color} tt="uppercase" lts={1}>
            {branch.name}
          </Title>
          <Text size="xs" c="dimmed">
            {branchPoints}/{branch.tiers.length} chosen
          </Text>
        </Stack>

        {branch.tiers.map((tier) => {
          const key = tierKey(branch.id, tier.tier);
          const selectedInTier = selectedPerks[key];
          const tierGateMet = branchPoints >= tier.requiresPointsInBranch;
          const prevCost =
            selectedInTier !== undefined
              ? (findPerk(selectedInTier)?.cost ?? 0)
              : 0;

          return (
            <Stack gap={4} key={tier.tier}>
              <Text size="10px" c="dimmed" tt="uppercase" lts={1}>
                Tier {tier.tier}
                {tier.requiresPointsInBranch > 0
                  ? ` · need ${tier.requiresPointsInBranch}`
                  : ''}
              </Text>
              {tier.options.map((option) => {
                const isSelected = selectedInTier === option.id;
                const effectiveCost = isSelected
                  ? 0
                  : option.cost - prevCost;
                const canAffordEffective = currency >= effectiveCost;
                return (
                  <PerkButton
                    key={option.id}
                    option={option}
                    branchId={branch.id}
                    branchColor={branch.color}
                    tier={tier.tier}
                    tierGateMet={tierGateMet}
                    tierRequiredPoints={tier.requiresPointsInBranch}
                    isSelected={isSelected}
                    isFocused={focusedPerkId === option.id}
                    isPinned={pinnedPerkId === option.id}
                    canAffordEffective={canAffordEffective}
                    onHover={onHover}
                    onPin={onPin}
                    onTrySelect={onTrySelect}
                  />
                );
              })}
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
};
