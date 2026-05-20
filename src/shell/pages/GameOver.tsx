import { Button, Center, Stack, Text, Title } from '@mantine/core';
import { useRunStore } from '../../state/runStore';
import { startNewRun } from '../../game/runLauncher';

export const GameOver = () => {
  const score = useRunStore((s) => s.score);

  return (
    <Center h="100vh" bg="#0a0014">
      <Stack align="center" gap={32}>
        <Title order={1} fz={64} fw={900} c="#ff006e" lts={4}>
          Game Over
        </Title>
        <Text ff="monospace" fz="xl" c="#00f5d4">
          Score: {score}
        </Text>
        <Button size="xl" radius="xl" color="#ff006e" onClick={startNewRun}>
          Restart
        </Button>
      </Stack>
    </Center>
  );
};
