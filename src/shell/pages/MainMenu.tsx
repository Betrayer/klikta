import { Button, Center, Stack, Title } from '@mantine/core';
import { useAppStore } from '../../state/appStore';
import { AccountButton } from '../components/AccountButton';
import { CustomizeModal } from '../components/CustomizeModal';

export const MainMenu = () => {
  const customizeOpen = useAppStore((s) => s.customizeOpen);
  const setCustomizeOpen = useAppStore((s) => s.setCustomizeOpen);

  return (
    <Center h="100vh" bg="background">
      <Stack align="center" gap={32}>
        <Title order={1} fz={96} fw={900} c="primary" lts={8}>
          KLIKTA
        </Title>
        <Stack gap="sm" w={260}>
          <Button
            size="lg"
            radius="xl"
            color="primary"
            onClick={() => useAppStore.getState().setScreen('mode-select')}
            fullWidth
          >
            Play
          </Button>
          <Button
            size="md"
            radius="xl"
            variant="outline"
            color="accent"
            onClick={() => useAppStore.getState().setScreen('skill-tree')}
            fullWidth
          >
            Skills
          </Button>
          <Button
            size="md"
            radius="xl"
            variant="outline"
            color="gold"
            onClick={() => useAppStore.getState().setScreen('leaderboard')}
            fullWidth
          >
            Leaderboard
          </Button>
          <AccountButton />
          <Button
            size="md"
            radius="xl"
            variant="subtle"
            color="highlight"
            onClick={() => setCustomizeOpen(true)}
            fullWidth
          >
            Customize
          </Button>
        </Stack>
      </Stack>
      <CustomizeModal
        opened={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
      />
    </Center>
  );
};
