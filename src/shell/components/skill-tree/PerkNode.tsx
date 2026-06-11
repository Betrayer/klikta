import { UnstyledButton } from "@mantine/core";
import { memo } from "react";
import { PerkIcon } from "../icons/PerkIcon";
import type { Vec2 } from "./layout";

export interface PerkNodeProps {
  perkId: string;
  pos: Vec2;
  radius: number;
  icon: string;
  branchColor: string;
  costLabel: string;
  isSelected: boolean;
  isLocked: boolean;
  isUnaffordable: boolean;
  isFocused: boolean;
  isUltimate: boolean;
  isFlashing: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

const PerkNodeImpl = ({
  perkId,
  pos,
  radius,
  icon,
  branchColor,
  costLabel,
  isSelected,
  isLocked,
  isUnaffordable,
  isFocused,
  isUltimate,
  isFlashing,
  onHover,
  onClick,
}: PerkNodeProps) => {
  const border = isFlashing
    ? "3px solid var(--mantine-color-red-6)"
    : isSelected
      ? `3px solid ${branchColor}`
      : isFocused
        ? `2px solid color-mix(in srgb, ${branchColor} 85%, transparent)`
        : isLocked
          ? "1.5px dashed color-mix(in srgb, white 18%, transparent)"
          : isUnaffordable
            ? `1.5px solid color-mix(in srgb, ${branchColor} 28%, transparent)`
            : `2px solid color-mix(in srgb, ${branchColor} 48%, transparent)`;

  const glow = isSelected
    ? `0 0 22px color-mix(in srgb, ${branchColor} 70%, transparent)`
    : isFocused
      ? `0 0 16px color-mix(in srgb, ${branchColor} 45%, transparent)`
      : "none";

  const ultimateRing = isUltimate
    ? `, 0 0 0 4px color-mix(in srgb, ${branchColor} 22%, transparent)`
    : "";

  const background = isSelected
    ? `color-mix(in srgb, ${branchColor} 26%, var(--mantine-color-surface-filled))`
    : "var(--mantine-color-surface-filled)";

  const iconColor = isLocked
    ? "color-mix(in srgb, white 40%, transparent)"
    : isSelected || isFocused
      ? branchColor
      : "color-mix(in srgb, white 82%, transparent)";

  const opacity = isLocked ? 0.5 : isUnaffordable ? 0.72 : 1;
  const scale = isFocused && !isSelected ? 1.08 : 1;

  return (
    <>
      <UnstyledButton
        onClick={() => onClick(perkId)}
        onMouseEnter={() => onHover(perkId)}
        onMouseLeave={() => onHover(null)}
        aria-label={perkId}
        style={{
          position: "absolute",
          left: pos.x - radius,
          top: pos.y - radius,
          width: radius * 2,
          height: radius * 2,
          borderRadius: "50%",
          border,
          background,
          boxShadow: `${glow}${ultimateRing}`,
          opacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${scale})`,
          transition:
            "transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease, opacity 140ms ease",
          animation: isFlashing
            ? "klikta-perk-flash 320ms ease 2"
            : undefined,
          touchAction: "none",
        }}
      >
        <PerkIcon
          name={isLocked ? "locked" : icon}
          size={radius * 1.05}
          color={iconColor}
        />
      </UnstyledButton>
      {costLabel !== "" && (
        <span
          style={{
            position: "absolute",
            left: pos.x,
            top: pos.y + radius + 5,
            transform: "translateX(-50%)",
            fontFamily: "var(--mantine-font-family-monospace)",
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            color: isUnaffordable
              ? "var(--mantine-color-danger-filled)"
              : "color-mix(in srgb, white 60%, transparent)",
          }}
        >
          {costLabel}
        </span>
      )}
    </>
  );
};

export const PerkNode = memo(PerkNodeImpl);
