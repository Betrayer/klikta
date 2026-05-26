import {
  Box,
  Button,
  Card,
  Container,
  Group,
  NumberFormatter,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { startNewRun } from '../../game/runLauncher';
import { MODES, type ModeMeta } from '../../data/modes';
import { useAppStore } from '../../state/appStore';
import { useMetaStore } from '../../state/metaStore';

export const ModeSelect = () => {
  const bestScores = useMetaStore((s) => s.bestScores);

  return (
    <Box bg="background" mih="100vh">
      <ScrollArea h="100vh" type="auto">
        <Container size={900} p="md">
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Title order={1} fz={36} fw={900} c="primary" lts={4}>
                SELECT MODE
              </Title>
              <Button
                variant="subtle"
                color="gray"
                onClick={() => useAppStore.getState().setScreen('menu')}
              >
                Back to Menu
              </Button>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {MODES.map((mode) => (
                <ModeCard
                  key={mode.id}
                  mode={mode}
                  best={bestScores[mode.id] ?? 0}
                />
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </ScrollArea>
    </Box>
  );
};

interface ModeCardProps {
  mode: ModeMeta;
  best: number;
}

const ModeCard = ({ mode, best }: ModeCardProps) => {
  return (
    <Card
      bg="surface"
      withBorder
      radius="md"
      padding="lg"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <Card.Section>
        <Box h={4} bg={mode.color} />
      </Card.Section>

      <Group gap="sm" align="center" mt="md" wrap="nowrap">
        <Text fz={40} lh={1} style={{ color: mode.color }}>
          {mode.icon}
        </Text>
        <Stack gap={0}>
          <Title order={2} fz={26} fw={900} c="gray.0" lts={1}>
            {mode.name}
          </Title>
          <Text size="sm" fw={700} style={{ color: mode.color }}>
            {mode.tagline}
          </Text>
        </Stack>
      </Group>

      <Text size="sm" c="gray.5" mt="sm" style={{ flex: 1 }}>
        {mode.description}
      </Text>

      <Group justify="space-between" align="baseline" mt="md">
        <Text size="xs" c="dimmed" tt="uppercase" lts={1}>
          Best
        </Text>
        {best > 0 ? (
          <Text ff="monospace" fz="lg" fw={700} c="highlight">
            <NumberFormatter value={best} thousandSeparator />
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            No record yet
          </Text>
        )}
      </Group>

      <Button
        size="md"
        radius="xl"
        color={mode.color}
        onClick={() => startNewRun(mode.id)}
        mt="md"
        fullWidth
      >
        Play
      </Button>
    </Card>
  );
};
