import type { Theme } from '../../data/themes/types';
import type { TargetKind } from '../../data/targetConfig';
import { backgroundCss, targetDotColor } from './themePreviewStyle';

const PREVIEW_TARGETS: TargetKind[] = [
  'regular',
  'golden',
  'multi',
  'shielded',
  'bomb',
];

interface ThemePreviewProps {
  theme: Theme;
}

export const ThemePreview = ({ theme }: ThemePreviewProps) => (
  <div
    style={{
      height: 64,
      borderRadius: 8,
      background: backgroundCss(theme.background),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      overflow: 'hidden',
    }}
  >
    {PREVIEW_TARGETS.map((kind) => {
      const color = targetDotColor(theme.targets[kind]);
      return (
        <span
          key={kind}
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      );
    })}
  </div>
);
