import { Divider, Modal, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ThemePicker } from './ThemePicker';
import { SoundPackPicker } from './SoundPackPicker';
import { LanguagePicker } from './LanguagePicker';

interface CustomizeModalProps {
  opened: boolean;
  onClose: () => void;
}

export const CustomizeModal = ({ opened, onClose }: CustomizeModalProps) => {
  const { t } = useTranslation();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('menu:customize')}
      centered
      size="lg"
      overlayProps={{ backgroundOpacity: 0.6, blur: 2 }}
    >
      <Stack gap="lg">
        <LanguagePicker />
        <Divider />
        <ThemePicker />
        <Divider />
        <SoundPackPicker />
      </Stack>
    </Modal>
  );
};
