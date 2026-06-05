import type { BranchId } from "../../../data/skillTree";
import { findPerk, tierKey } from "../../../data/skillTree";
import type { PanZoomController } from "./usePanZoom";
import type { BranchLayout, SkillTreeLayout } from "./layout";
import { PerkNode } from "./PerkNode";
import { touchRadiusMul } from "../../../game/util/device";

export interface SkillTreeCanvasProps {
  layout: SkillTreeLayout;
  selectedPerks: Record<string, string>;
  branchPoints: Record<BranchId, number>;
  currency: number;
  focusedPerkId: string | null;
  panZoom: PanZoomController;
  onHover: (id: string | null) => void;
  onNodeClick: (perkId: string) => void;
}

const DIM_LINE = "color-mix(in srgb, white 9%, transparent)";

const BranchLines = ({
  branch,
  selectedPerks,
}: {
  branch: BranchLayout;
  selectedPerks: Record<string, string>;
}) => (
  <g>
    {branch.backbone.map((segment) => {
      const reached =
        selectedPerks[tierKey(branch.id, segment.outerTier)] !== undefined;
      return (
        <g key={`bb-${branch.id}-${segment.outerTier}`}>
          {reached && (
            <line
              x1={segment.from.x}
              y1={segment.from.y}
              x2={segment.to.x}
              y2={segment.to.y}
              stroke={branch.color}
              strokeOpacity={0.22}
              strokeWidth={12}
              strokeLinecap="round"
            />
          )}
          <line
            x1={segment.from.x}
            y1={segment.from.y}
            x2={segment.to.x}
            y2={segment.to.y}
            stroke={reached ? branch.color : DIM_LINE}
            strokeOpacity={reached ? 0.95 : 1}
            strokeWidth={reached ? 4 : 3}
            strokeLinecap="round"
          />
        </g>
      );
    })}
    {branch.tiers.flatMap((tier) =>
      tier.nodes.map((node) => {
        const selected = selectedPerks[tierKey(branch.id, tier.tier)] === node.perkId;
        return (
          <line
            key={`fork-${node.perkId}`}
            x1={node.forkFrom.x}
            y1={node.forkFrom.y}
            x2={node.pos.x}
            y2={node.pos.y}
            stroke={selected ? branch.color : DIM_LINE}
            strokeOpacity={selected ? 0.85 : 1}
            strokeWidth={selected ? 3.5 : 2}
            strokeLinecap="round"
          />
        );
      }),
    )}
  </g>
);

export const SkillTreeCanvas = ({
  layout,
  selectedPerks,
  branchPoints,
  currency,
  focusedPerkId,
  panZoom,
  onHover,
  onNodeClick,
}: SkillTreeCanvasProps) => {
  const { containerRef, transform, onPointerDown, onPointerMove, onPointerUp } =
    panZoom;
  const nodeRadius = layout.nodeRadius * touchRadiusMul();
  const totalSelected = layout.branches.reduce(
    (sum, branch) => sum + (branchPoints[branch.id] ?? 0),
    0,
  );
  const totalPerks = layout.branches.reduce(
    (sum, branch) => sum + branch.tiers.length,
    0,
  );

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        cursor: "grab",
      }}
    >
      <div
        style={{
          position: "relative",
          width: layout.size,
          height: layout.size,
          transformOrigin: "0 0",
          transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
        }}
      >
        <svg
          width={layout.size}
          height={layout.size}
          viewBox={`0 0 ${layout.size} ${layout.size}`}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          aria-hidden
        >
          {layout.branches.map((branch) => (
            <BranchLines
              key={branch.id}
              branch={branch}
              selectedPerks={selectedPerks}
            />
          ))}
        </svg>

        <div
          style={{
            position: "absolute",
            left: layout.center.x - layout.hubRadius,
            top: layout.center.y - layout.hubRadius,
            width: layout.hubRadius * 2,
            height: layout.hubRadius * 2,
            borderRadius: "50%",
            border: "2px solid var(--mantine-color-primary-filled)",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--mantine-color-primary-filled) 18%, var(--mantine-color-surface-filled)) 0%, var(--mantine-color-surface-filled) 75%)",
            boxShadow:
              "0 0 26px color-mix(in srgb, var(--mantine-color-primary-filled) 45%, transparent)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <span
            style={{
              fontFamily: "var(--mantine-font-family-monospace)",
              fontSize: 24,
              fontWeight: 900,
              color: "var(--mantine-color-gold-filled)",
              lineHeight: 1,
            }}
          >
            {currency}
          </span>
          <span
            style={{
              fontSize: 11,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "color-mix(in srgb, white 55%, transparent)",
            }}
          >
            {totalSelected}/{totalPerks} perks
          </span>
        </div>

        {layout.branches.map((branch) => (
          <div
            key={`label-${branch.id}`}
            style={{
              position: "absolute",
              left: branch.labelPos.x,
              top: branch.labelPos.y,
              transform: "translate(-50%, -50%)",
              padding: "2px 8px",
              borderRadius: 6,
              background:
                "color-mix(in srgb, var(--mantine-color-background-filled) 78%, transparent)",
              textAlign: "center",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: branch.color,
              }}
            >
              {branch.name}
            </div>
            <div
              style={{
                fontFamily: "var(--mantine-font-family-monospace)",
                fontSize: 10,
                color: "color-mix(in srgb, white 50%, transparent)",
              }}
            >
              {branchPoints[branch.id] ?? 0}/{branch.tiers.length}
            </div>
          </div>
        ))}

        {layout.branches.flatMap((branch) =>
          branch.tiers.flatMap((tier) =>
            tier.nodes.map((node) => {
              const option = findPerk(node.perkId);
              if (option === undefined) return null;
              const key = tierKey(branch.id, tier.tier);
              const selectedInTier = selectedPerks[key];
              const isSelected = selectedInTier === node.perkId;
              const gateMet =
                (branchPoints[branch.id] ?? 0) >= node.requiresPointsInBranch;
              const isLocked = !gateMet && !isSelected;
              const prevCost =
                selectedInTier !== undefined && selectedInTier !== node.perkId
                  ? (findPerk(selectedInTier)?.cost ?? 0)
                  : 0;
              const effectiveCost = isSelected ? 0 : option.cost - prevCost;
              const isUnaffordable =
                !isLocked && !isSelected && currency < effectiveCost;
              const isUltimate = option.effects.some(
                (effect) => effect.kind === "ultimateUnlock",
              );
              return (
                <PerkNode
                  key={node.perkId}
                  perkId={node.perkId}
                  pos={node.pos}
                  radius={nodeRadius}
                  icon={option.icon}
                  branchColor={branch.color}
                  costLabel={isSelected || isLocked ? "" : String(effectiveCost)}
                  isSelected={isSelected}
                  isLocked={isLocked}
                  isUnaffordable={isUnaffordable}
                  isFocused={focusedPerkId === node.perkId}
                  isUltimate={isUltimate}
                  onHover={onHover}
                  onClick={onNodeClick}
                />
              );
            }),
          ),
        )}
      </div>
    </div>
  );
};
