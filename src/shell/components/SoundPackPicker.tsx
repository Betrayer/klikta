import { Button, Group, Stack, Text } from '@mantine/core';
import { SOUND_PACKS } from '../../data/sound';
import { useMetaStore } from '../../state/metaStore';
import { isTouchDevice } from '../../game/util/device';

interface PackRowProps {
  label: string;
  activeId: string;
  onSelect: (id: string) => void;
}

const PackRow = ({ label, activeId, onSelect }: PackRowProps) => (
  <Stack gap={6}>
    <Text size="xs" c="dimmed" tt="uppercase" lts={2}>
      {label}
    </Text>
    <Group gap="xs">
      {Object.values(SOUND_PACKS).map((pack) => (
        <Button
          key={pack.id}
          size={isTouchDevice() ? 'md' : 'xs'}
          radius="xl"
          color="accent"
          variant={pack.id === activeId ? 'filled' : 'outline'}
          onClick={() => onSelect(pack.id)}
        >
          {pack.name}
        </Button>
      ))}
    </Group>
  </Stack>
);

export const SoundPackPicker = () => {
  const activeMusicPackId = useMetaStore((s) => s.activeMusicPackId);
  const activeSfxPackId = useMetaStore((s) => s.activeSfxPackId);
  const setActiveMusicPack = useMetaStore((s) => s.setActiveMusicPack);
  const setActiveSfxPack = useMetaStore((s) => s.setActiveSfxPack);

  return (
    <Stack gap="md">
      <PackRow
        label="Music"
        activeId={activeMusicPackId}
        onSelect={setActiveMusicPack}
      />
      <PackRow
        label="SFX"
        activeId={activeSfxPackId}
        onSelect={setActiveSfxPack}
      />
    </Stack>
  );
};
