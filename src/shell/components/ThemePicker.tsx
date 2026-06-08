import { Badge, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { THEMES } from '../../data/themes';
import { SOUND_PACKS } from '../../data/sound';
import { useMetaStore } from '../../state/metaStore';
import { ThemePreview } from './ThemePreview';

export const ThemePicker = () => {
  const { t } = useTranslation();
  const activeThemeId = useMetaStore((s) => s.activeThemeId);
  const setActiveTheme = useMetaStore((s) => s.setActiveTheme);
  const setActiveMusicPack = useMetaStore((s) => s.setActiveMusicPack);
  const setActiveSfxPack = useMetaStore((s) => s.setActiveSfxPack);

  const apply = (id: string) => {
    const theme = THEMES[id];
    if (theme === undefined) return;
    setActiveTheme(id);
    setActiveMusicPack(theme.defaultSoundPack);
    setActiveSfxPack(theme.defaultSoundPack);
  };

  return (
    <Stack gap={8}>
      <Text size="xs" c="dimmed" tt="uppercase" lts={2}>
        {t('menu:themeSection')}
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {Object.values(THEMES).map((theme) => {
          const active = theme.id === activeThemeId;
          const musicPackName = SOUND_PACKS[theme.defaultSoundPack]?.name;
          return (
            <Card
              key={theme.id}
              withBorder
              padding="sm"
              radius="md"
              onClick={() => apply(theme.id)}
              style={{
                cursor: 'pointer',
                background: theme.ui.surface,
                borderColor: active ? theme.ui.primary : theme.ui.border,
                borderWidth: active ? 2 : 1,
              }}
            >
              <Stack gap={8}>
                <ThemePreview theme={theme} />
                <Text
                  size="sm"
                  fw={active ? 700 : 500}
                  style={{ color: active ? theme.ui.primary : theme.ui.text }}
                >
                  {theme.name}
                  {active ? ' ✓' : ''}
                </Text>
                <Group gap={6}>
                  <Badge size="xs" variant="light" color="gray">
                    {t(`menu:backgroundKind.${theme.background.kind}`)}
                  </Badge>
                  {musicPackName !== undefined && (
                    <Badge size="xs" variant="light" color="gray">
                      {musicPackName}
                    </Badge>
                  )}
                </Group>
              </Stack>
            </Card>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
};
