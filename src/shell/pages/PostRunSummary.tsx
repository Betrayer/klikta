import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Group,
  NumberFormatter,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { startNewRun } from '../../game/runLauncher';
import {
  findPerk,
  findTierForPerk,
  SKILL_TREE,
  tierKey,
  type SkillBranch,
} from '../../data/skillTree';
import { useAppStore } from '../../state/appStore';
import { useMetaStore } from '../../state/metaStore';
import { useRunStore } from '../../state/runStore';
import type { ModeId } from '../../data/modes';
import {
  getLeaderboardValue,
  submitScore,
  type ScoreMeta,
  type SubmitResult,
} from '../../services/leaderboard';

const ACHIEVEMENT_NAMES: Readonly<Record<string, string>> = {
  'first-run': 'First Run',
  'combo-25': 'Combo 25',
  'combo-50': 'Combo 50',
  'combo-100': 'Combo 100',
  'no-bomb-clicks': 'No Bomb Clicks',
  'first-skill': 'First Skill Unlocked',
};

const SCORE_COUNTUP_MS = 800;
const CURRENCY_LINE_DELAY_MS = 150;
const CURRENCY_LINE_MS = 400;

const formatDuration = (ms: number): string => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, '0');
  const ss = (totalSec % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
};

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const useCountUp = (
  target: number,
  durationMs: number,
  delayMs: number,
): number => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    let startTs = 0;
    const tick = (now: number): void => {
      if (startTs === 0) startTs = now;
      const safeDuration = Math.max(1, durationMs);
      const t = Math.min(1, (now - startTs) / safeDuration);
      setValue(Math.round(target * easeOutCubic(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const timeoutId = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, Math.max(0, delayMs));
    return () => {
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(raf);
    };
  }, [target, durationMs, delayMs]);
  return value;
};

interface ActivePerkRow {
  perkId: string;
  perkName: string;
  branch: SkillBranch;
}

const collectActivePerks = (
  selectedPerks: Record<string, string>,
): ActivePerkRow[] => {
  const rows: ActivePerkRow[] = [];
  for (const branch of SKILL_TREE) {
    for (const tier of branch.tiers) {
      const key = tierKey(branch.id, tier.tier);
      const perkId = selectedPerks[key];
      if (perkId === undefined) continue;
      const perk = findPerk(perkId);
      if (perk === undefined) continue;
      const found = findTierForPerk(perkId);
      if (found === undefined) continue;
      rows.push({ perkId, perkName: perk.name, branch: found.branch });
    }
  }
  return rows;
};

interface CurrencyLine {
  key: string;
  label: string;
  amount: number;
  highlight?: boolean;
}

let lastSubmitKey: string | null = null;
let lastSubmitPromise: Promise<SubmitResult> | null = null;

const submitRunOnce = (
  key: string,
  mode: ModeId,
  value: number,
  meta: ScoreMeta,
): Promise<SubmitResult> => {
  if (lastSubmitKey === key && lastSubmitPromise !== null) {
    return lastSubmitPromise;
  }
  lastSubmitKey = key;
  lastSubmitPromise = submitScore(mode, value, meta);
  return lastSubmitPromise;
};

const handlePlayAgain = (): void => {
  const mode = useRunStore.getState().mode;
  startNewRun(mode);
};

const handleSkillTree = (): void => {
  useRunStore.getState().reset();
  useAppStore.getState().setScreen('skill-tree');
};

const handleLeaderboard = (): void => {
  useRunStore.getState().reset();
  useAppStore.getState().setScreen('leaderboard');
};

const handleMainMenu = (): void => {
  useRunStore.getState().reset();
  useAppStore.getState().setScreen('menu');
};

export const PostRunSummary = () => {
  const score = useRunStore((s) => s.score);
  const maxCombo = useRunStore((s) => s.maxCombo);
  const elapsedMs = useRunStore((s) => s.elapsedMs);
  const mode = useRunStore((s) => s.mode);
  const breakdown = useRunStore((s) => s.currencyBreakdown);
  const previousBest = useRunStore((s) => s.previousBestScore);
  const victory = useRunStore((s) => s.victory);
  const selectedPerks = useMetaStore((s) => s.selectedPerks);

  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(true);

  useEffect(() => {
    const value = getLeaderboardValue(mode, { score, durationMs: elapsedMs });
    const meta: ScoreMeta = {
      durationMs: elapsedMs,
      maxCombo,
      build: Object.values(selectedPerks),
    };
    const key = `${mode}:${score}:${elapsedMs}`;
    let cancelled = false;
    submitRunOnce(key, mode, value, meta).then((result) => {
      if (cancelled) return;
      setSubmitting(false);
      setSubmitResult(result);
    });
    return () => {
      cancelled = true;
    };
  }, [mode, score, elapsedMs, maxCombo, selectedPerks]);

  const isNewBest = score > 0 && score > previousBest;
  const titleText = victory ? 'VICTORY' : 'RUN OVER';
  const titleColor = victory ? '#ffd700' : '#ff006e';
  const displayedScore = useCountUp(score, SCORE_COUNTUP_MS, 0);
  const displayedCombo = useCountUp(maxCombo, SCORE_COUNTUP_MS, 100);

  const currencyLines = useMemo<CurrencyLine[]>(() => {
    if (breakdown === null) return [];
    const lines: CurrencyLine[] = [];
    if (breakdown.base > 0) {
      lines.push({ key: 'base', label: 'Score', amount: breakdown.base });
    }
    if (breakdown.comboBonus > 0) {
      lines.push({
        key: 'combo',
        label: 'Combo Bonus',
        amount: breakdown.comboBonus,
      });
    }
    if (breakdown.victoryBonus > 0) {
      lines.push({
        key: 'victory',
        label: 'Victory Bonus',
        amount: breakdown.victoryBonus,
        highlight: true,
      });
    }
    if (breakdown.bombBounty > 0) {
      lines.push({
        key: 'bombBounty',
        label: 'Bomb Bounty',
        amount: breakdown.bombBounty,
      });
    }
    if (breakdown.comboCoin > 0) {
      lines.push({
        key: 'comboCoin',
        label: 'Combo Coins',
        amount: breakdown.comboCoin,
      });
    }
    for (const ach of breakdown.achievements) {
      const label = ACHIEVEMENT_NAMES[ach.id] ?? ach.id;
      lines.push({
        key: `ach-${ach.id}`,
        label: `${label}`,
        amount: ach.amount,
        highlight: true,
      });
    }
    return lines;
  }, [breakdown]);

  const activePerks = useMemo(
    () => collectActivePerks(selectedPerks),
    [selectedPerks],
  );

  const totalEarned = breakdown?.total ?? 0;
  const totalDelay =
    currencyLines.length * CURRENCY_LINE_DELAY_MS + CURRENCY_LINE_MS;
  const displayedTotal = useCountUp(totalEarned, CURRENCY_LINE_MS, totalDelay);

  return (
    <Box bg="#0a0014" mih="100vh">
      <Center mih="100vh" p="md">
        <Container size={720} w="100%">
          <Stack gap="lg">
            <Stack gap={4} align="center">
              <Title order={1} fz={56} fw={900} c={titleColor} lts={4}>
                {titleText}
              </Title>
              {isNewBest && (
                <Badge
                  color="#ffd700"
                  variant="filled"
                  size="lg"
                  radius="sm"
                  style={{
                    color: '#0a0014',
                    boxShadow: '0 0 24px rgba(255, 215, 0, 0.6)',
                  }}
                >
                  NEW BEST
                </Badge>
              )}
              <RankLine submitting={submitting} result={submitResult} />
            </Stack>

            <Paper p="lg" bg="#0d0118" withBorder>
              <Stack gap="md">
                <Group justify="space-between" align="baseline">
                  <Text size="sm" c="dimmed" tt="uppercase" lts={1}>
                    Score
                  </Text>
                  <Text ff="monospace" fz={36} fw={700} c="#00f5d4">
                    <NumberFormatter
                      value={displayedScore}
                      thousandSeparator
                    />
                  </Text>
                </Group>
                <Group justify="space-between" align="baseline">
                  <Text size="sm" c="dimmed" tt="uppercase" lts={1}>
                    Max Combo
                  </Text>
                  <Text ff="monospace" fz="xl" c="#00f0ff">
                    {displayedCombo}
                  </Text>
                </Group>
                <Group justify="space-between" align="baseline">
                  <Text size="sm" c="dimmed" tt="uppercase" lts={1}>
                    Time
                  </Text>
                  <Text ff="monospace" fz="xl" c="gray.3">
                    {formatDuration(elapsedMs)}
                  </Text>
                </Group>
                {!isNewBest && previousBest > 0 && (
                  <Group justify="space-between" align="baseline">
                    <Text size="xs" c="dimmed" tt="uppercase" lts={1}>
                      Best
                    </Text>
                    <Text ff="monospace" size="sm" c="dimmed">
                      <NumberFormatter
                        value={previousBest}
                        thousandSeparator
                      />
                    </Text>
                  </Group>
                )}
              </Stack>
            </Paper>

            <Paper p="lg" bg="#0d0118" withBorder>
              <Stack gap="sm">
                <Text size="sm" c="dimmed" tt="uppercase" lts={1}>
                  Currency Earned
                </Text>
                {currencyLines.length === 0 && (
                  <Text size="sm" c="dimmed" ta="center" py="sm">
                    No currency earned this run.
                  </Text>
                )}
                {currencyLines.map((line, i) => (
                  <CurrencyRow
                    key={line.key}
                    label={line.label}
                    amount={line.amount}
                    delayMs={i * CURRENCY_LINE_DELAY_MS}
                    highlight={line.highlight ?? false}
                  />
                ))}
                {totalEarned > 0 && (
                  <>
                    <Divider color="#1f0a33" />
                    <Group justify="space-between" align="baseline">
                      <Text size="sm" fw={700} c="#ffd700" tt="uppercase" lts={1}>
                        Total
                      </Text>
                      <Text ff="monospace" fz="xl" fw={700} c="#ffd700">
                        +{displayedTotal}
                      </Text>
                    </Group>
                  </>
                )}
              </Stack>
            </Paper>

            {activePerks.length > 0 && (
              <Paper p="lg" bg="#0d0118" withBorder>
                <Stack gap="sm">
                  <Text size="sm" c="dimmed" tt="uppercase" lts={1}>
                    Active Perks
                  </Text>
                  <Group gap="xs">
                    {activePerks.map((row) => (
                      <Badge
                        key={row.perkId}
                        variant="outline"
                        radius="sm"
                        style={{
                          borderColor: row.branch.color,
                          color: row.branch.color,
                        }}
                        leftSection={
                          <Box
                            w={8}
                            h={8}
                            style={{
                              borderRadius: 999,
                              backgroundColor: row.branch.color,
                            }}
                          />
                        }
                      >
                        {row.perkName}
                      </Badge>
                    ))}
                  </Group>
                </Stack>
              </Paper>
            )}

            <Group justify="center" gap="sm" wrap="wrap">
              <Button
                size="lg"
                radius="xl"
                color="#ff006e"
                onClick={handlePlayAgain}
              >
                Play Again
              </Button>
              <Button
                size="md"
                radius="xl"
                variant="outline"
                color="#00f0ff"
                onClick={handleSkillTree}
              >
                Skill Tree
              </Button>
              <Button
                size="md"
                radius="xl"
                variant="outline"
                color="#ffd700"
                onClick={handleLeaderboard}
              >
                Leaderboard
              </Button>
              <Button
                size="md"
                radius="xl"
                variant="subtle"
                color="gray"
                onClick={handleMainMenu}
              >
                Main Menu
              </Button>
            </Group>
          </Stack>
        </Container>
      </Center>
    </Box>
  );
};

interface CurrencyRowProps {
  label: string;
  amount: number;
  delayMs: number;
  highlight: boolean;
}

const CurrencyRow = ({
  label,
  amount,
  delayMs,
  highlight,
}: CurrencyRowProps) => {
  const displayed = useCountUp(amount, CURRENCY_LINE_MS, delayMs);
  const color = highlight ? '#ffd700' : 'gray.3';
  return (
    <Group justify="space-between" align="baseline">
      <Text size="sm" c={highlight ? '#ffd700' : 'gray.4'}>
        {label}
      </Text>
      <Text ff="monospace" size="sm" c={color}>
        +{displayed}
      </Text>
    </Group>
  );
};

interface RankLineProps {
  submitting: boolean;
  result: SubmitResult | null;
}

const RankLine = ({ submitting, result }: RankLineProps) => {
  if (result === null) {
    if (!submitting) return null;
    return (
      <Text size="sm" c="dimmed">
        Submitting score...
      </Text>
    );
  }
  if (result.status === 'submitted' && result.rank !== null) {
    return (
      <Text size="sm" fw={700} c="#ffd700">
        Ranked #{result.rank} globally
      </Text>
    );
  }
  if (result.status === 'not-best' && result.rank !== null) {
    return (
      <Text size="sm" c="dimmed">
        Best rank #{result.rank} globally
      </Text>
    );
  }
  if (result.status === 'failed') {
    return (
      <Text size="xs" c="dimmed">
        Leaderboard unavailable
      </Text>
    );
  }
  return null;
};
