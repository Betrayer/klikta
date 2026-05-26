import { Button, Group, Stack, Text } from '@mantine/core';
import { THEMES } from '../../data/themes';
import { useMetaStore } from '../../state/metaStore';

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
    <Stack gap={8} align="center">
      <Text size="xs" c="dimmed" tt="uppercase" lts={2}>
        Theme
      </Text>
      <Group gap="xs" justify="center">
        {Object.values(THEMES).map((theme) => (
          <Button
            key={theme.id}
            size="xs"
            radius="xl"
            color="primary"
            variant={theme.id === activeThemeId ? 'filled' : 'outline'}
            onClick={() => apply(theme.id)}
            leftSection={
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: theme.ui.primary,
                  display: 'inline-block',
                }}
              />
            }
          >
            {theme.name}
          </Button>
        ))}
      </Group>
    </Stack>
  );
};
