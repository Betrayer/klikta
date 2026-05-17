import { Button, Center, Stack, Title } from '@mantine/core';
import { useRunStore } from '../../state/runStore';

export const MainMenu = () => {
  const startRun = useRunStore((s) => s.startRun);

  return (
    <Center h="100vh" bg="#0a0014">
      <Stack align="center" gap={48}>
        <Title order={1} fz={96} fw={900} c="#ff006e" lts={8}>
          KLIKTA
        </Title>
        <Button
          size="xl"
          radius="xl"
          color="#ff006e"
          onClick={startRun}
        >
          Start
        </Button>
      </Stack>
    </Center>
  );
};
