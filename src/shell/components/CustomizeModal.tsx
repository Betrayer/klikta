import { Divider, Modal, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { ThemePicker } from './ThemePicker';
import { HudStylePicker } from './HudStylePicker';
import { SoundPackPicker } from './SoundPackPicker';
import { LanguagePicker } from './LanguagePicker';

interface CustomizeModalProps {
  opened: boolean;
  onClose: () => void;
}

export const CustomizeModal = ({ opened, onClose }: CustomizeModalProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 640px)');
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('menu:customize')}
      centered
      size="lg"
      fullScreen={isMobile}
      overlayProps={{ backgroundOpacity: 0.6, blur: 2 }}
    >
      <Stack gap="lg">
        <LanguagePicker />
        <Divider />
        <ThemePicker />
        <Divider />
        <HudStylePicker />
        <Divider />
        <SoundPackPicker />
      </Stack>
    </Modal>
  );
};
