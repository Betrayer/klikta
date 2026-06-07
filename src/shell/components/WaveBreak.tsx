import { Box, Card, Group, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useCampaignStore } from '../../state/campaignStore';
import { requestRunPerkPick } from '../../game/modes/runPerkPick';
import { useLocalize } from '../../i18n/useLocalize';

export const WaveBreak = () => {
  const { t } = useTranslation();
  const loc = useLocalize();
  const breakActive = useCampaignStore((s) => s.breakActive);
  const upcomingWave = useCampaignStore((s) => s.upcomingWave);
  const totalWaves = useCampaignStore((s) => s.totalWaves);
  const choices = useCampaignStore((s) => s.choices);

  if (!breakActive) return null;

  return (
    <Box
      pos="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      style={{
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        backgroundColor:
          'color-mix(in srgb, var(--mantine-color-background-filled) 82%, transparent)',
      }}
    >
      <Stack align="center" gap="xl" maw={900} px="md" w="100%">
        <Stack align="center" gap={4}>
          <Title order={2} fz={40} fw={900} c="info" lts={3}>
            {t('game:waveBreak.cleared')}
          </Title>
          <Text c="dimmed" size="sm" tt="uppercase" lts={2}>
            {t('game:waveBreak.chooseBoon', {
              wave: upcomingWave,
              total: totalWaves,
            })}
          </Text>
        </Stack>

        <Group justify="center" gap="lg" wrap="wrap">
          {choices.map((choice) => (
            <Card
              key={choice.id}
              w={240}
              mih={150}
              p="lg"
              radius="md"
              withBorder
              bg="surface"
              style={{
                cursor: 'pointer',
                borderColor: 'var(--mantine-color-info-filled)',
              }}
              onClick={() => requestRunPerkPick(choice.id)}
            >
              <Stack gap="xs" h="100%" justify="space-between">
                <Text fz="lg" fw={700} c="accent">
                  {loc('runPerks', choice.id, 'name', choice.name)}
                </Text>
                <Text size="sm" c="gray.3">
                  {loc('runPerks', choice.id, 'description', choice.description)}
                </Text>
              </Stack>
            </Card>
          ))}
        </Group>
      </Stack>
    </Box>
  );
};
