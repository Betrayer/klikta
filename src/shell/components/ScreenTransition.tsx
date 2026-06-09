import type { ReactNode } from 'react';
import { useMetaStore } from '../../state/metaStore';
import { DEFAULT_THEME, THEMES } from '../../data/themes';
import type { ScreenTransition as ScreenTransitionKind } from '../../data/themes/types';

const ANIMATION_NAME: Record<Exclude<ScreenTransitionKind, 'none'>, string> = {
  fade: 'klikta-screen-fade',
  slide: 'klikta-screen-slide',
  wipe: 'klikta-screen-wipe',
};

const DEFAULT_DURATION_MS = 250;

interface ScreenTransitionProps {
  screenKey: string;
  children: ReactNode;
}

export const ScreenTransition = ({ screenKey, children }: ScreenTransitionProps) => {
  const themeId = useMetaStore((s) => s.activeThemeId);
  const transitions = (THEMES[themeId] ?? DEFAULT_THEME).transitions;
  const change = transitions?.screenChange;

  if (change === undefined || change === 'none') return <>{children}</>;

  const duration = transitions?.durationMs ?? DEFAULT_DURATION_MS;
  return (
    <div
      key={screenKey}
      style={{
        width: '100vw',
        height: '100dvh',
        animation: `${ANIMATION_NAME[change]} ${duration}ms ease both`,
      }}
    >
      {children}
    </div>
  );
};
