import {
  Box,
  Button,
  Center,
  Container,
  Group,
  Loader,
  NumberFormatter,
  ScrollArea,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { MODES, MODE_BY_ID, type ModeId } from '../../data/modes';
import { useAppStore } from '../../state/appStore';
import { useAuthStore } from '../../state/authStore';
import {
  getTopScores,
  type LeaderboardEntry,
} from '../../services/leaderboard';

const formatDuration = (ms: number): string => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, '0');
  const ss = (totalSec % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
};

const isModeId = (value: string): value is ModeId =>
  MODES.some((mode) => mode.id === value);

type LoadState = 'loading' | 'ready' | 'error';

export const LeaderboardView = () => {
  const [activeMode, setActiveMode] = useState<ModeId>(MODES[0]?.id ?? 'endless_hp');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const ownUid = useAuthStore((s) => s.account?.uid ?? null);

  useEffect(() => {
    let cancelled = false;
    getTopScores(activeMode)
      .then((result) => {
        if (cancelled) return;
        setEntries(result);
        setLoadState('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [activeMode]);

  const mode = MODE_BY_ID[activeMode];
  const isDuration = mode.leaderboardSort === 'duration_desc';

  return (
    <Box bg="background" mih="100vh">
      <ScrollArea h="100vh" type="auto">
        <Container size={720} p="md">
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Title order={1} fz={36} fw={900} c="primary" lts={4}>
                LEADERBOARD
              </Title>
              <Button
                variant="subtle"
                color="gray"
                onClick={() => useAppStore.getState().setScreen('menu')}
              >
                Back to Menu
              </Button>
            </Group>

            <Tabs
              value={activeMode}
              onChange={(value) => {
                if (value === null || !isModeId(value)) return;
                if (value === activeMode) return;
                setLoadState('loading');
                setEntries([]);
                setActiveMode(value);
              }}
              color={mode.color}
              variant="pills"
              radius="xl"
            >
              <Tabs.List>
                {MODES.map((m) => (
                  <Tabs.Tab key={m.id} value={m.id}>
                    {m.name}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>

            {loadState === 'loading' && (
              <Center py={64}>
                <Loader color={mode.color} />
              </Center>
            )}

            {loadState === 'error' && (
              <Text c="dimmed" ta="center" py={64}>
                Could not load the leaderboard. Check your connection and try
                again.
              </Text>
            )}

            {loadState === 'ready' && entries.length === 0 && (
              <Text c="dimmed" ta="center" py={64}>
                No scores yet. Be the first to set one.
              </Text>
            )}

            {loadState === 'ready' && entries.length > 0 && (
              <Table
                striped
                highlightOnHover
                verticalSpacing="sm"
                horizontalSpacing="md"
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={56}>#</Table.Th>
                    <Table.Th>Player</Table.Th>
                    <Table.Th ta="right" w={96}>
                      Combo
                    </Table.Th>
                    <Table.Th ta="right" w={120}>
                      {isDuration ? 'Time' : 'Score'}
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {entries.map((entry, index) => {
                    const isOwn = entry.uid === ownUid;
                    return (
                      <Table.Tr
                        key={entry.uid}
                        bg={
                          isOwn
                            ? 'color-mix(in srgb, var(--mantine-color-highlight-filled) 12%, transparent)'
                            : undefined
                        }
                      >
                        <Table.Td>
                          <Text ff="monospace" c="dimmed">
                            {index + 1}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text
                            fw={isOwn ? 700 : 400}
                            c={isOwn ? 'highlight' : 'gray.2'}
                          >
                            {entry.displayName}
                            {isOwn ? ' (you)' : ''}
                          </Text>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Text ff="monospace" c="gray.5">
                            {entry.maxCombo}
                          </Text>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Text ff="monospace" fw={700} c={mode.color}>
                            {isDuration ? (
                              formatDuration(entry.value)
                            ) : (
                              <NumberFormatter
                                value={entry.value}
                                thousandSeparator
                              />
                            )}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        </Container>
      </ScrollArea>
    </Box>
  );
};
