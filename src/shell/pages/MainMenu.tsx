import { Button, Center, Stack, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../state/appStore';
import { AccountButton } from '../components/AccountButton';
import { CustomizeModal } from '../components/CustomizeModal';

export const MainMenu = () => {
  const { t } = useTranslation();
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
            {t('common:play')}
          </Button>
          <Button
            size="md"
            radius="xl"
            variant="outline"
            color="accent"
            onClick={() => useAppStore.getState().setScreen('skill-tree')}
            fullWidth
          >
            {t('menu:skills')}
          </Button>
          <Button
            size="md"
            radius="xl"
            variant="outline"
            color="gold"
            onClick={() => useAppStore.getState().setScreen('leaderboard')}
            fullWidth
          >
            {t('common:leaderboard')}
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
            {t('menu:customize')}
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
