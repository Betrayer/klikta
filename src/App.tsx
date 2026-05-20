import { GameCanvas } from './shell/components/GameCanvas';
import { InGameHUD } from './shell/pages/InGameHUD';
import { SettingsOverlay } from './shell/components/SettingsOverlay';
import { MainMenu } from './shell/pages/MainMenu';
import { GameOver } from './shell/pages/GameOver';
import { SkillTreeView } from './shell/pages/SkillTreeView';
import { useRunStore } from './state/runStore';
import { useAppStore } from './state/appStore';

export const App = () => {
  const status = useRunStore((s) => s.status);
  const screen = useAppStore((s) => s.screen);

  if (status === 'playing') {
    return (
      <>
        <GameCanvas />
        <InGameHUD />
        <SettingsOverlay />
      </>
    );
  }

  if (status === 'gameOver') return <GameOver />;
  if (screen === 'skill-tree') return <SkillTreeView />;
  return <MainMenu />;
};
