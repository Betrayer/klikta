import {
  ActionIcon,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useCallback, useMemo, useState } from 'react';
import type {
  BranchId,
  SkillOption,
  TierLevel,
} from '../../data/skillTree';
import { findPerk, SKILL_TREE, tierKey } from '../../data/skillTree';
import { useAppStore } from '../../state/appStore';
import { useMetaStore } from '../../state/metaStore';
import { PerkDetails } from '../components/skill-tree/PerkDetails';
import { SkillTreeCanvas } from '../components/skill-tree/SkillTreeCanvas';
import { SKILL_TREE_LAYOUT } from '../components/skill-tree/layout';
import { usePanZoom } from '../components/skill-tree/usePanZoom';

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
  if (meta.unlockAchievement('first-skill')) {
    meta.awardCurrency(25);
  }
  for (const eff of option.effects) {
    if (eff.kind === 'ultimateUnlock') {
      meta.unlockUltimate(eff.id);
    }
  }
};

const TEST_CURRENCY_GRANT = 20000;

const grantTestCurrency = (): void => {
  useMetaStore.getState().awardCurrency(TEST_CURRENCY_GRANT);
};

const resetTestCurrency = (): void => {
  const meta = useMetaStore.getState();
  meta.spendCurrency(meta.currency);
};

export const SkillTreeView = () => {
  const [hoveredPerkId, setHoveredPerkId] = useState<string | null>(null);
  const [pinnedPerkId, setPinnedPerkId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingSelection | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const focusedPerkId = hoveredPerkId ?? pinnedPerkId;

  const selectedPerks = useMetaStore((s) => s.selectedPerks);
  const currency = useMetaStore((s) => s.currency);
  const panZoom = usePanZoom(SKILL_TREE_LAYOUT.size);

  const branchPoints = useMemo(() => {
    const counts = {} as Record<BranchId, number>;
    for (const branch of SKILL_TREE) {
      counts[branch.id] = branch.tiers.filter(
        (t) => selectedPerks[tierKey(branch.id, t.tier)] !== undefined,
      ).length;
    }
    return counts;
  }, [selectedPerks]);

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

  const handleNodeClick = useCallback(
    (perkId: string) => {
      if (panZoom.wasDragging()) return;
      setPinnedPerkId(perkId);
    },
    [panZoom],
  );

  const confirmPending = () => {
    if (pending === null) return;
    applySelection(pending.option, pending.branchId, pending.tier);
    setPending(null);
  };

  const selectedCount = Object.keys(selectedPerks).length;
  const refundTotal = useMemo(
    () =>
      Object.values(selectedPerks).reduce(
        (sum, id) => sum + (findPerk(id)?.cost ?? 0),
        0,
      ),
    [selectedPerks],
  );

  const resetAllPerks = () => {
    const meta = useMetaStore.getState();
    let refund = 0;
    for (const id of Object.values(meta.selectedPerks)) {
      refund += findPerk(id)?.cost ?? 0;
    }
    if (refund > 0) meta.awardCurrency(refund);
    meta.clearPerks();
    setConfirmReset(false);
  };

  return (
    <Box bg="background" pos="relative" h="100vh" style={{ overflow: 'hidden' }}>
      <SkillTreeCanvas
        layout={SKILL_TREE_LAYOUT}
        selectedPerks={selectedPerks}
        branchPoints={branchPoints}
        currency={currency}
        focusedPerkId={focusedPerkId}
        panZoom={panZoom}
        onHover={setHoveredPerkId}
        onNodeClick={handleNodeClick}
      />

      <Group
        justify="space-between"
        align="center"
        p="md"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <Title order={1} fz={28} fw={900} c="primary" lts={4}>
          SKILL TREE
        </Title>
        <Group gap="xs" style={{ pointerEvents: 'auto' }}>
          <Button
            variant="outline"
            color="red"
            disabled={selectedCount === 0}
            onClick={() => setConfirmReset(true)}
          >
            Reset Perks
          </Button>
          <Button
            variant="light"
            color="gray"
            onClick={() => useAppStore.getState().setScreen('menu')}
          >
            Back to Menu
          </Button>
        </Group>
      </Group>

      <Stack
        gap="xs"
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 20,
        }}
      >
        <Tooltip label="Zoom in" position="left">
          <ActionIcon
            variant="default"
            size="lg"
            onClick={() => panZoom.zoomBy(1.25)}
            aria-label="Zoom in"
          >
            +
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Zoom out" position="left">
          <ActionIcon
            variant="default"
            size="lg"
            onClick={() => panZoom.zoomBy(0.8)}
            aria-label="Zoom out"
          >
            -
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Reset view" position="left">
          <ActionIcon
            variant="default"
            size="lg"
            onClick={panZoom.reset}
            aria-label="Reset view"
          >
            ⌂
          </ActionIcon>
        </Tooltip>
      </Stack>

      {focusedPerkId === null && (
        <Text
          size="sm"
          c="dimmed"
          ta="center"
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          Tap a perk to inspect - drag to pan, scroll or pinch to zoom.
        </Text>
      )}

      <PerkDetails focusedPerkId={focusedPerkId} onTrySelect={handleTrySelect} />

      <Group
        gap="xs"
        style={{ position: 'absolute', bottom: 16, left: 16, zIndex: 20 }}
      >
        <Button
          size="xs"
          variant="light"
          color="teal"
          onClick={grantTestCurrency}
        >
          test +{TEST_CURRENCY_GRANT}
        </Button>
        <Button
          size="xs"
          variant="subtle"
          color="gray"
          onClick={resetTestCurrency}
        >
          reset test
        </Button>
      </Group>

      <Modal
        opened={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset all perks?"
        centered
        overlayProps={{ backgroundOpacity: 0.7, blur: 2 }}
      >
        <Stack>
          <Text size="sm">
            Deselects all {selectedCount} perks and refunds{' '}
            <Text component="span" fw={700}>
              {refundTotal}
            </Text>{' '}
            currency. You can re-select them anytime.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={resetAllPerks}>
              Reset Perks
            </Button>
          </Group>
        </Stack>
      </Modal>

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
              <Button color="primary" onClick={confirmPending}>
                Bind
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};
