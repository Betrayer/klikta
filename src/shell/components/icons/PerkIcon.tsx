import { PERK_ICONS } from "./perkIcons";
import { isPerkIconName } from "./perkIconNames";

interface PerkIconProps {
  name: string;
  size?: number;
  color?: string;
}

export const PerkIcon = ({ name, size = 24, color }: PerkIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color, display: "block", flexShrink: 0 }}
    aria-hidden
  >
    {PERK_ICONS[isPerkIconName(name) ? name : "fallback"]}
  </svg>
);
