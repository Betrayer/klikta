import { Button, Center, Stack, Title } from '@mantine/core';
import { startNewRun } from '../../game/runLauncher';
import { useAppStore } from '../../state/appStore';

export const MainMenu = () => {
  return (
    <Center h="100vh" bg="#0a0014">
      <Stack align="center" gap={32}>
        <Title order={1} fz={96} fw={900} c="#ff006e" lts={8}>
          KLIKTA
        </Title>
        <Stack gap="sm" w={240}>
          <Button
            size="xl"
            radius="xl"
            color="#ff006e"
            onClick={startNewRun}
            fullWidth
          >
            Start
          </Button>
          <Button
            size="md"
            radius="xl"
            variant="outline"
            color="#00f0ff"
            onClick={() => useAppStore.getState().setScreen('skill-tree')}
            fullWidth
          >
            Skills
          </Button>
        </Stack>
      </Stack>
    </Center>
  );
};
