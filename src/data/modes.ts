export type ModeId =
  | "endless_hp"
  | "endless_timer"
  | "campaign"
  | "physics_chaos";

export type LeaderboardSort = "score_desc" | "duration_desc";

export interface ModeMeta {
  id: ModeId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  leaderboardSort: LeaderboardSort;
}

export const DEFAULT_MODE: ModeId = "endless_hp";

export const MODES: readonly ModeMeta[] = [
  {
    id: "endless_hp",
    name: "Endless",
    tagline: "Survive. Score.",
    description:
      "The original loop. Miss a target and lose HP. Run ends when HP hits zero. Stack combos for score.",
    icon: "∞",
    color: "#ff006e",
    leaderboardSort: "score_desc",
  },
  {
    id: "endless_timer",
    name: "Time Attack",
    tagline: "Race the clock.",
    description:
      "Start with a shrinking timer. Every hit buys you more time. Greed keeps you alive; hesitation kills.",
    icon: "⏱",
    color: "#00f5d4",
    leaderboardSort: "duration_desc",
  },
  {
    id: "campaign",
    name: "Campaign",
    tagline: "15 waves.",
    description:
      "A scripted run of escalating waves with a run-scoped perk choice between each. Clear wave 15 to win.",
    icon: "⚔",
    color: "#3a86ff",
    leaderboardSort: "score_desc",
  },
  {
    id: "physics_chaos",
    name: "Chaos",
    tagline: "Everything moves.",
    description:
      "Targets drift, bounce, and merge. Clicks shove the nearby ones. Reaction under motion.",
    icon: "🌀",
    color: "#9d4edd",
    leaderboardSort: "score_desc",
  },
];

export const MODE_BY_ID: Record<ModeId, ModeMeta> = MODES.reduce(
  (acc, mode) => {
    acc[mode.id] = mode;
    return acc;
  },
  {} as Record<ModeId, ModeMeta>,
);
