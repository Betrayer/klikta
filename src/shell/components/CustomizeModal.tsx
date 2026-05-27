import { Divider, Modal, Stack } from '@mantine/core';
import { ThemePicker } from './ThemePicker';
import { SoundPackPicker } from './SoundPackPicker';

interface CustomizeModalProps {
  opened: boolean;
  onClose: () => void;
}

export const CustomizeModal = ({ opened, onClose }: CustomizeModalProps) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title="Customize"
    centered
    size="lg"
    overlayProps={{ backgroundOpacity: 0.6, blur: 2 }}
  >
    <Stack gap="lg">
      <ThemePicker />
      <Divider />
      <SoundPackPicker />
    </Stack>
  </Modal>
);
