import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Slider,
  Stack,
  Text,
} from '@mantine/core';
import { useRunStore } from '../../state/runStore';
import { useSettingsStore } from '../../state/settingsStore';
import { useMetaStore } from '../../state/metaStore';
import { audioSystem } from '../../game/systems/AudioSystem';

const toPercent = (v: number): number => Math.round(v * 100);

export const SettingsOverlay = () => {
  const paused = useRunStore((s) => s.paused);
  const setPaused = useRunStore((s) => s.setPaused);

  const masterVolume = useSettingsStore((s) => s.masterVolume);
  const sfxVolume = useSettingsStore((s) => s.sfxVolume);
  const musicVolume = useSettingsStore((s) => s.musicVolume);
  const setMasterVolume = useSettingsStore((s) => s.setMasterVolume);
  const setSFXVolume = useSettingsStore((s) => s.setSFXVolume);
  const setMusicVolume = useSettingsStore((s) => s.setMusicVolume);

  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const state = useRunStore.getState();
      if (state.status !== 'playing') return;
      state.setPaused(!state.paused);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const quitToMenu = () => {
    audioSystem.stopMusic();
    useRunStore.getState().reset();
  };

  const performReset = () => {
    useMetaStore.getState().resetAllProgress();
    useSettingsStore.getState().reset();
    setConfirmReset(false);
  };

  return (
    <>
      {!paused && (
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          aria-label="Settings"
          pos="fixed"
          bottom={8}
          left={12}
          style={{ zIndex: 10 }}
          onClick={() => setPaused(true)}
        >
          <Text fz={20}>⚙</Text>
        </ActionIcon>
      )}

      <Modal
        opened={paused}
        onClose={() => setPaused(false)}
        title="Settings"
        centered
        closeOnEscape={false}
        overlayProps={{ backgroundOpacity: 0.6, blur: 2 }}
      >
        <Stack gap="lg">
          <Stack gap={4}>
            <Text size="sm">Master — {toPercent(masterVolume)}%</Text>
            <Slider
              value={toPercent(masterVolume)}
              onChange={(v) => setMasterVolume(v / 100)}
              min={0}
              max={100}
            />
          </Stack>

          <Stack gap={4}>
            <Text size="sm">SFX — {toPercent(sfxVolume)}%</Text>
            <Slider
              value={toPercent(sfxVolume)}
              onChange={(v) => setSFXVolume(v / 100)}
              min={0}
              max={100}
            />
          </Stack>

          <Stack gap={4}>
            <Text size="sm">Music — {toPercent(musicVolume)}%</Text>
            <Slider
              value={toPercent(musicVolume)}
              onChange={(v) => setMusicVolume(v / 100)}
              min={0}
              max={100}
            />
          </Stack>

          <Button fullWidth color="#ff006e" onClick={() => setPaused(false)}>
            Resume
          </Button>
          <Button
            fullWidth
            variant="outline"
            color="red"
            onClick={() => setConfirmReset(true)}
          >
            Reset Progress
          </Button>
          <Button fullWidth variant="default" onClick={quitToMenu}>
            Quit to Menu
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Delete all progress?"
        centered
        zIndex={1100}
        overlayProps={{ backgroundOpacity: 0.7 }}
      >
        <Stack>
          <Text size="sm">
            This erases currency, perks, achievements, and settings. Cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={performReset}>
              Delete everything
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
