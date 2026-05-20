import { GameCanvas } from './shell/components/GameCanvas';
import { InGameHUD } from './shell/pages/InGameHUD';
import { SettingsOverlay } from './shell/components/SettingsOverlay';
import { MainMenu } from './shell/pages/MainMenu';
import { PostRunSummary } from './shell/pages/PostRunSummary';
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

  if (status === 'gameOver') return <PostRunSummary />;
  if (screen === 'skill-tree') return <SkillTreeView />;
  return <MainMenu />;
};
