import { GameCanvas } from './shell/components/GameCanvas';
import { InGameHUD } from './shell/pages/InGameHUD';
import { SettingsOverlay } from './shell/components/SettingsOverlay';
import { MainMenu } from './shell/pages/MainMenu';
import { GameOver } from './shell/pages/GameOver';
import { useRunStore } from './state/runStore';

export const App = () => {
  const status = useRunStore((s) => s.status);

  if (status === 'idle') return <MainMenu />;
  if (status === 'gameOver') return <GameOver />;

  return (
    <>
      <GameCanvas />
      <InGameHUD />
      <SettingsOverlay />
    </>
  );
};
