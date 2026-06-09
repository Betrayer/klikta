import {
  Box,
  Button,
  Card,
  Container,
  Group,
  NumberFormatter,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { startNewRun } from '../../game/runLauncher';
import { MODES, type ModeMeta } from '../../data/modes';
import { useAppStore } from '../../state/appStore';
import { useMetaStore } from '../../state/metaStore';
import { useLocalize } from '../../i18n/useLocalize';
import { MenuButton } from '../components/menu/MenuButton';
import { MenuShell } from '../components/menu/MenuShell';

export const ModeSelect = () => {
  const { t } = useTranslation();
  const bestScores = useMetaStore((s) => s.bestScores);

  return (
    <MenuShell>
      <Container size={900} p="md">
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Title order={1} fz={36} fw={900} c="primary" lts={4}>
              {t('menu:modeSelect.title')}
            </Title>
            <MenuButton
              variant="tertiary"
              fullWidth={false}
              onClick={() => useAppStore.getState().setScreen('menu')}
            >
              {t('common:back')}
            </MenuButton>
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
    </MenuShell>
  );
};

interface ModeCardProps {
  mode: ModeMeta;
  best: number;
}

const ModeCard = ({ mode, best }: ModeCardProps) => {
  const { t } = useTranslation();
  const loc = useLocalize();
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
            {loc('modes', mode.id, 'name', mode.name)}
          </Title>
          <Text size="sm" fw={700} style={{ color: mode.color }}>
            {loc('modes', mode.id, 'tagline', mode.tagline)}
          </Text>
        </Stack>
      </Group>

      <Text size="sm" c="gray.5" mt="sm" style={{ flex: 1 }}>
        {loc('modes', mode.id, 'description', mode.description)}
      </Text>

      <Group justify="space-between" align="baseline" mt="md">
        <Text size="xs" c="dimmed" tt="uppercase" lts={1}>
          {t('common:best')}
        </Text>
        {best > 0 ? (
          <Text ff="monospace" fz="lg" fw={700} c="highlight">
            <NumberFormatter value={best} thousandSeparator />
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            {t('menu:modeSelect.noRecord')}
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
        {t('common:play')}
      </Button>
    </Card>
  );
};
