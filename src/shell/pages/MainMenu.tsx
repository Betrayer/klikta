import { Box, Center, Stack, Title } from '@mantine/core';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../state/appStore';
import { useSettingsStore } from '../../state/settingsStore';
import { AccountButton } from '../components/AccountButton';
import { CustomizeModal } from '../components/CustomizeModal';
import { MenuButton } from '../components/menu/MenuButton';
import { MenuShell } from '../components/menu/MenuShell';

export const MainMenu = () => {
  const { t } = useTranslation();
  const customizeOpen = useAppStore((s) => s.customizeOpen);
  const setCustomizeOpen = useAppStore((s) => s.setCustomizeOpen);
  const setScreen = useAppStore((s) => s.setScreen);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const items: { key: string; node: ReactNode }[] = [
    {
      key: 'play',
      node: (
        <MenuButton variant="primary" onClick={() => setScreen('mode-select')}>
          {t('common:play')}
        </MenuButton>
      ),
    },
    {
      key: 'skills',
      node: (
        <MenuButton variant="secondary" onClick={() => setScreen('skill-tree')}>
          {t('menu:skills')}
        </MenuButton>
      ),
    },
    {
      key: 'leaderboard',
      node: (
        <MenuButton
          variant="secondary"
          onClick={() => setScreen('leaderboard')}
        >
          {t('common:leaderboard')}
        </MenuButton>
      ),
    },
    { key: 'account', node: <AccountButton /> },
    {
      key: 'customize',
      node: (
        <MenuButton variant="tertiary" onClick={() => setCustomizeOpen(true)}>
          {t('menu:customize')}
        </MenuButton>
      ),
    },
  ];

  return (
    <MenuShell>
      <Center mih="100vh" p="md">
        <Stack align="center" gap={32} w="100%" maw={360}>
          <Title
            order={1}
            fz={96}
            fw={900}
            c="primary"
            lts={8}
            style={{
              textShadow:
                '0 0 24px color-mix(in srgb, var(--mantine-color-primary-filled) 60%, transparent)',
            }}
          >
            KLIKTA
          </Title>
          <Stack gap="sm" style={{ width: 'min(320px, calc(100% - 32px))' }}>
            {items.map((item, index) => (
              <Box
                key={item.key}
                className={reduceMotion ? undefined : 'klikta-menu-rise'}
                style={
                  reduceMotion
                    ? undefined
                    : { animationDelay: `${index * 80}ms` }
                }
              >
                {item.node}
              </Box>
            ))}
          </Stack>
        </Stack>
      </Center>
      <CustomizeModal
        opened={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
      />
    </MenuShell>
  );
};
