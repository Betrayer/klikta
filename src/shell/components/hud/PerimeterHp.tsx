import type { ThemeColorKey } from '../../../data/themes/types';

interface PerimeterHpProps {
  hp: number;
  maxHp: number;
  accent: ThemeColorKey;
}

export const PerimeterHp = ({ hp, maxHp, accent }: PerimeterHpProps) => {
  const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;
  const color = `var(--mantine-color-${accent}-6)`;

  return (
    <svg
      width="100%"
      height="100%"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 9,
      }}
    >
      <rect
        x="1%"
        y="1%"
        width="98%"
        height="98%"
        rx={14}
        ry={14}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={4}
      />
      {pct > 0 && (
        <rect
          x="1%"
          y="1%"
          width="98%"
          height="98%"
          rx={14}
          ry={14}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${pct} 100`}
          style={{
            transition: 'stroke-dasharray 220ms ease-out',
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      )}
    </svg>
  );
};
