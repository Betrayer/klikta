import { GameCanvas } from './shell/components/GameCanvas';
import { InGameHUD } from './shell/pages/InGameHUD';
import { SettingsOverlay } from './shell/components/SettingsOverlay';
import { MainMenu } from './shell/pages/MainMenu';
import { PostRunSummary } from './shell/pages/PostRunSummary';
import { SkillTreeView } from './shell/pages/SkillTreeView';
import { ClosedTest } from './shell/pages/ClosedTest';
import { WebGate } from './shell/pages/WebGate';
import { useRunStore } from './state/runStore';
import { useAppStore } from './state/appStore';
import { getTelegramSession, isTelegramAccessAllowed } from './services/telegram';
import { isWebGateEnabled, isWebUnlocked } from './services/webAccess';
import { useState } from 'react';

export const App = () => {
  const status = useRunStore((s) => s.status);
  const screen = useAppStore((s) => s.screen);
  const [webUnlocked, setWebUnlocked] = useState(isWebUnlocked);

  if (!isTelegramAccessAllowed()) return <ClosedTest />;

  const webGateActive = !getTelegramSession().isTelegram && isWebGateEnabled();
  if (webGateActive && !webUnlocked) {
    return <WebGate onUnlock={() => setWebUnlocked(true)} />;
  }

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
