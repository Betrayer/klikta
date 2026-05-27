import { Card, Group, Stack, Text } from '@mantine/core';
import { THEMES } from '../../data/themes';
import type { ThemeUiColors } from '../../data/themes/types';
import { useMetaStore } from '../../state/metaStore';

const SWATCH_KEYS: (keyof ThemeUiColors)[] = [
  'primary',
  'accent',
  'gold',
  'highlight',
  'info',
];

export const ThemePicker = () => {
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
        Theme
      </Text>
      <Group gap="sm">
        {Object.values(THEMES).map((theme) => {
          const active = theme.id === activeThemeId;
          return (
            <Card
              key={theme.id}
              withBorder
              padding="sm"
              radius="md"
              onClick={() => apply(theme.id)}
              style={{
                cursor: 'pointer',
                minWidth: 140,
                background: theme.ui.surface,
                borderColor: active ? theme.ui.primary : theme.ui.border,
                borderWidth: active ? 2 : 1,
              }}
            >
              <Stack gap={10}>
                <Group gap={6}>
                  {SWATCH_KEYS.map((key) => (
                    <span
                      key={key}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        background: theme.ui[key],
                      }}
                    />
                  ))}
                </Group>
                <Text
                  size="sm"
                  fw={active ? 700 : 500}
                  style={{ color: active ? theme.ui.primary : theme.ui.text }}
                >
                  {theme.name}
                  {active ? ' ✓' : ''}
                </Text>
              </Stack>
            </Card>
          );
        })}
      </Group>
    </Stack>
  );
};
