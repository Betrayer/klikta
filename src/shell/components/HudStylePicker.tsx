import { Button, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMetaStore } from '../../state/metaStore';
import type { HudStyle } from '../../data/themes/types';
import { isTouchDevice } from '../../game/util/device';

const OPTIONS: HudStyle[] = ['framed', 'minimal', 'ringed'];

export const HudStylePicker = () => {
  const { t } = useTranslation();
  const active = useMetaStore((s) => s.activeHudStyle);
  const setActiveHudStyle = useMetaStore((s) => s.setActiveHudStyle);

  return (
    <Stack gap={6}>
      <Text size="xs" c="dimmed" tt="uppercase" lts={2}>
        {t('menu:hudSection')}
      </Text>
      <Group gap="xs">
        {OPTIONS.map((option) => (
          <Button
            key={option}
            size={isTouchDevice() ? 'md' : 'xs'}
            radius="xl"
            color="accent"
            variant={option === active ? 'filled' : 'outline'}
            onClick={() => setActiveHudStyle(option)}
          >
            {t(`menu:hudStyle.${option}`)}
          </Button>
        ))}
      </Group>
    </Stack>
  );
};
