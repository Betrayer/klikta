import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { useRunStore } from '../../state/runStore';
import { startNewRun } from '../../game/runLauncher';
import { useAppStore } from '../../state/appStore';

export const GameOver = () => {
  const score = useRunStore((s) => s.score);

  const openSkillTree = () => {
    useRunStore.getState().reset();
    useAppStore.getState().setScreen('skill-tree');
  };

  return (
    <Center h="100vh" bg="#0a0014">
      <Stack align="center" gap={32}>
        <Title order={1} fz={64} fw={900} c="#ff006e" lts={4}>
          Game Over
        </Title>
        <Text ff="monospace" fz="xl" c="#00f5d4">
          Score: {score}
        </Text>
        <Stack gap="sm" w={240}>
          <Button
            size="xl"
            radius="xl"
            color="#ff006e"
            onClick={startNewRun}
            fullWidth
          >
            Restart
          </Button>
          <Button
            size="md"
            radius="xl"
            variant="outline"
            color="#00f0ff"
            onClick={openSkillTree}
            fullWidth
          >
            Skill Tree
          </Button>
        </Stack>
      </Stack>
    </Center>
  );
};
