import { GameCanvas } from './shell/components/GameCanvas';
import { InGameHUD } from './shell/pages/InGameHUD';
import { WaveBreak } from './shell/components/WaveBreak';
import { SettingsOverlay } from './shell/components/SettingsOverlay';
import { MainMenu } from './shell/pages/MainMenu';
import { ModeSelect } from './shell/pages/ModeSelect';
import { PostRunSummary } from './shell/pages/PostRunSummary';
import { SkillTreeView } from './shell/pages/SkillTreeView';
import { LeaderboardView } from './shell/pages/LeaderboardView';
import { ClosedTest } from './shell/pages/ClosedTest';
import { WebGate } from './shell/pages/WebGate';
import { ScreenTransition } from './shell/components/ScreenTransition';
import { useRunStore } from './state/runStore';
import { useAppStore } from './state/appStore';
import { getTelegramSession, isTelegramAccessAllowed } from './services/telegram';
import { isWebGateEnabled, isWebUnlocked } from './services/webAccess';
import { useState } from 'react';
import type { ReactNode } from 'react';

export const App = () => {
  const status = useRunStore((s) => s.status);
  const screen = useAppStore((s) => s.screen);
  const [webUnlocked, setWebUnlocked] = useState(isWebUnlocked);

  if (!isTelegramAccessAllowed()) return <ClosedTest />;

  const webGateActive = !getTelegramSession().isTelegram && isWebGateEnabled();
  if (webGateActive && !webUnlocked) {
    return <WebGate onUnlock={() => setWebUnlocked(true)} />;
  }

  let screenKey: string;
  let content: ReactNode;

  if (status === 'playing') {
    screenKey = 'playing';
    content = (
      <>
        <GameCanvas />
        <InGameHUD />
        <WaveBreak />
        <SettingsOverlay />
      </>
    );
  } else if (status === 'gameOver') {
    screenKey = 'game-over';
    content = <PostRunSummary />;
  } else if (screen === 'mode-select') {
    screenKey = screen;
    content = <ModeSelect />;
  } else if (screen === 'skill-tree') {
    screenKey = screen;
    content = <SkillTreeView />;
  } else if (screen === 'leaderboard') {
    screenKey = screen;
    content = <LeaderboardView />;
  } else {
    screenKey = 'menu';
    content = <MainMenu />;
  }

  return <ScreenTransition screenKey={screenKey}>{content}</ScreenTransition>;
};
