import {
  Box,
  Button,
  Container,
  Group,
  Modal,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useCallback, useState } from 'react';
import type {
  BranchId,
  SkillOption,
  TierLevel,
} from '../../data/skillTree';
import { findPerk, SKILL_TREE, tierKey } from '../../data/skillTree';
import { useAppStore } from '../../state/appStore';
import { useMetaStore } from '../../state/metaStore';
import { BranchColumn } from '../components/skill-tree/BranchColumn';
import { CurrencyHeader } from '../components/skill-tree/CurrencyHeader';
import { PerkDetails } from '../components/skill-tree/PerkDetails';

interface PendingSelection {
  option: SkillOption;
  branchId: BranchId;
  tier: TierLevel;
  effectiveCost: number;
}

const applySelection = (
  option: SkillOption,
  branchId: BranchId,
  tier: TierLevel,
): void => {
  const meta = useMetaStore.getState();
  const key = tierKey(branchId, tier);
  const prevId = meta.selectedPerks[key];
  if (prevId === option.id) return;

  const prevCost =
    prevId !== undefined ? (findPerk(prevId)?.cost ?? 0) : 0;
  const effectiveCost = option.cost - prevCost;
  if (meta.currency < effectiveCost) return;

  if (prevId !== undefined && prevCost > 0) {
    meta.awardCurrency(prevCost);
  }
  if (!meta.spendCurrency(option.cost)) {
    if (prevId !== undefined && prevCost > 0) {
      meta.spendCurrency(prevCost);
    }
    return;
  }
  meta.selectPerk(key, option.id);
  for (const eff of option.effects) {
    if (eff.kind === 'ultimateUnlock') {
      meta.unlockUltimate(eff.id);
      if (meta.activeUltimate === null) {
        meta.setActiveUltimate(eff.id);
      }
    }
  }
};

export const SkillTreeView = () => {
  const [hoveredPerkId, setHoveredPerkId] = useState<string | null>(null);
  const [pinnedPerkId, setPinnedPerkId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingSelection | null>(null);
  const focusedPerkId = hoveredPerkId ?? pinnedPerkId;

  const handleTrySelect = useCallback(
    (option: SkillOption, branchId: BranchId, tier: TierLevel) => {
      if (tier === 4) {
        const meta = useMetaStore.getState();
        const key = tierKey(branchId, tier);
        const prevId = meta.selectedPerks[key];
        const prevCost =
          prevId !== undefined ? (findPerk(prevId)?.cost ?? 0) : 0;
        setPending({
          option,
          branchId,
          tier,
          effectiveCost: option.cost - prevCost,
        });
        return;
      }
      applySelection(option, branchId, tier);
    },
    [],
  );

  const confirmPending = () => {
    if (pending === null) return;
    applySelection(pending.option, pending.branchId, pending.tier);
    setPending(null);
  };

  return (
    <Box bg="#0a0014" mih="100vh">
      <ScrollArea h="100vh" type="auto">
        <Container size={1600} p="md">
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Title order={1} fz={36} fw={900} c="#ff006e" lts={4}>
                SKILL TREE
              </Title>
              <Button
                variant="subtle"
                color="gray"
                onClick={() => useAppStore.getState().setScreen('menu')}
              >
                Back to Menu
              </Button>
            </Group>

            <CurrencyHeader />

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="md">
              {SKILL_TREE.map((branch) => (
                <BranchColumn
                  key={branch.id}
                  branch={branch}
                  focusedPerkId={focusedPerkId}
                  pinnedPerkId={pinnedPerkId}
                  onHover={setHoveredPerkId}
                  onPin={setPinnedPerkId}
                  onTrySelect={handleTrySelect}
                />
              ))}
            </SimpleGrid>

            <PerkDetails
              focusedPerkId={focusedPerkId}
              onTrySelect={handleTrySelect}
            />
          </Stack>
        </Container>
      </ScrollArea>

      <Modal
        opened={pending !== null}
        onClose={() => setPending(null)}
        title="Bind ultimate?"
        centered
        overlayProps={{ backgroundOpacity: 0.7, blur: 2 }}
      >
        {pending !== null && (
          <Stack>
            <Text size="sm">
              Bind <Text component="span" fw={700}>{pending.option.name}</Text>{' '}
              as your active ultimate for {pending.effectiveCost} currency?
            </Text>
            <Text size="xs" c="dimmed">
              {pending.option.description}
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setPending(null)}>
                Cancel
              </Button>
              <Button color="#ff006e" onClick={confirmPending}>
                Bind
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};
