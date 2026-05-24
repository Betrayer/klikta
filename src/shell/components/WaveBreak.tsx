import { Box, Card, Group, Stack, Text, Title } from '@mantine/core';
import { useCampaignStore } from '../../state/campaignStore';
import { requestRunPerkPick } from '../../game/modes/runPerkPick';

export const WaveBreak = () => {
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
        backgroundColor: 'rgba(10, 0, 20, 0.82)',
      }}
    >
      <Stack align="center" gap="xl" maw={900} px="md" w="100%">
        <Stack align="center" gap={4}>
          <Title order={2} fz={40} fw={900} c="#3a86ff" lts={3}>
            WAVE CLEARED
          </Title>
          <Text c="dimmed" size="sm" tt="uppercase" lts={2}>
            Choose a boon - Wave {upcomingWave} / {totalWaves} next
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
              bg="#0d0118"
              style={{ cursor: 'pointer', borderColor: '#3a86ff' }}
              onClick={() => requestRunPerkPick(choice.id)}
            >
              <Stack gap="xs" h="100%" justify="space-between">
                <Text fz="lg" fw={700} c="#00f0ff">
                  {choice.name}
                </Text>
                <Text size="sm" c="gray.3">
                  {choice.description}
                </Text>
              </Stack>
            </Card>
          ))}
        </Group>
      </Stack>
    </Box>
  );
};
