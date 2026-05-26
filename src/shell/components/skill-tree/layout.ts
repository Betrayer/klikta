import type { BranchId, TierLevel } from "../../../data/skillTree";
import { SKILL_TREE } from "../../../data/skillTree";

export interface Vec2 {
  x: number;
  y: number;
}

export interface BackboneSegment {
  from: Vec2;
  to: Vec2;
  outerTier: TierLevel;
}

export interface NodeLayout {
  perkId: string;
  branchId: BranchId;
  tier: TierLevel;
  requiresPointsInBranch: number;
  pos: Vec2;
  forkFrom: Vec2;
}

export interface TierLayout {
  tier: TierLevel;
  requiresPointsInBranch: number;
  center: Vec2;
  nodes: readonly NodeLayout[];
}

export interface BranchLayout {
  id: BranchId;
  name: string;
  color: string;
  angleRad: number;
  labelPos: Vec2;
  backbone: readonly BackboneSegment[];
  tiers: readonly TierLayout[];
}

export interface SkillTreeLayout {
  size: number;
  center: Vec2;
  hubRadius: number;
  nodeRadius: number;
  branches: readonly BranchLayout[];
}

const LOGICAL_SIZE = 1600;
const HUB_RADIUS = 84;
const TIER_BASE_RADIUS = 245;
const TIER_GAP = 150;
const OPTION_GAP = 84;
const NODE_RADIUS = 30;
const LABEL_RADIUS = 156;
const START_ANGLE = -Math.PI / 2;

const buildSkillTreeLayout = (): SkillTreeLayout => {
  const center: Vec2 = { x: LOGICAL_SIZE / 2, y: LOGICAL_SIZE / 2 };
  const branchCount = SKILL_TREE.length;

  const branches = SKILL_TREE.map((branch, branchIndex): BranchLayout => {
    const angle = START_ANGLE + (branchIndex / branchCount) * Math.PI * 2;
    const radial: Vec2 = { x: Math.cos(angle), y: Math.sin(angle) };
    const tangent: Vec2 = { x: -Math.sin(angle), y: Math.cos(angle) };

    const tiers = [...branch.tiers]
      .sort((a, b) => a.tier - b.tier)
      .map((tier): TierLayout => {
        const radius = TIER_BASE_RADIUS + (tier.tier - 1) * TIER_GAP;
        const tierCenter: Vec2 = {
          x: center.x + radial.x * radius,
          y: center.y + radial.y * radius,
        };
        const optionCount = tier.options.length;
        const nodes = tier.options.map((option, optionIndex): NodeLayout => {
          const offset = (optionIndex - (optionCount - 1) / 2) * OPTION_GAP;
          return {
            perkId: option.id,
            branchId: branch.id,
            tier: tier.tier,
            requiresPointsInBranch: tier.requiresPointsInBranch,
            pos: {
              x: tierCenter.x + tangent.x * offset,
              y: tierCenter.y + tangent.y * offset,
            },
            forkFrom: tierCenter,
          };
        });
        return {
          tier: tier.tier,
          requiresPointsInBranch: tier.requiresPointsInBranch,
          center: tierCenter,
          nodes,
        };
      });

    const backbone: BackboneSegment[] = [];
    let previous: Vec2 = {
      x: center.x + radial.x * HUB_RADIUS,
      y: center.y + radial.y * HUB_RADIUS,
    };
    for (const tier of tiers) {
      backbone.push({ from: previous, to: tier.center, outerTier: tier.tier });
      previous = tier.center;
    }

    return {
      id: branch.id,
      name: branch.name,
      color: branch.color,
      angleRad: angle,
      labelPos: {
        x: center.x + radial.x * LABEL_RADIUS,
        y: center.y + radial.y * LABEL_RADIUS,
      },
      backbone,
      tiers,
    };
  });

  return {
    size: LOGICAL_SIZE,
    center,
    hubRadius: HUB_RADIUS,
    nodeRadius: NODE_RADIUS,
    branches,
  };
};

export const SKILL_TREE_LAYOUT: SkillTreeLayout = buildSkillTreeLayout();
