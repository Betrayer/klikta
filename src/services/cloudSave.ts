import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { MODES, type ModeId } from "../data/modes";
import type { MetaSnapshot } from "../state/metaStore";

const MODE_ID_SET = new Set<string>(MODES.map((m) => m.id));

const userDoc = (uid: string) => doc(db, "users", uid);

const toNumber = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

const toStringRecord = (value: unknown): Record<string, string> => {
  if (typeof value !== "object" || value === null) return {};
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string") result[key] = item;
  }
  return result;
};

const toScoreRecord = (value: unknown): Partial<Record<ModeId, number>> => {
  if (typeof value !== "object" || value === null) return {};
  const result: Partial<Record<ModeId, number>> = {};
  for (const [key, item] of Object.entries(value)) {
    if (MODE_ID_SET.has(key) && typeof item === "number") {
      result[key as ModeId] = item;
    }
  }
  return result;
};

const parseSnapshot = (value: unknown): MetaSnapshot => {
  const data: Record<string, unknown> =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  return {
    currency: toNumber(data.currency),
    totalEarnedCurrency: toNumber(data.totalEarnedCurrency),
    selectedPerks: toStringRecord(data.selectedPerks),
    unlockedUltimates: toStringArray(data.unlockedUltimates),
    runsCompleted: toNumber(data.runsCompleted),
    totalRunScore: toNumber(data.totalRunScore),
    bestScores: toScoreRecord(data.bestScores),
    achievements: toStringArray(data.achievements),
    updatedAt: toNumber(data.updatedAt),
  };
};

export const loadCloudSave = async (
  uid: string,
): Promise<MetaSnapshot | null> => {
  const snapshot = await getDoc(userDoc(uid));
  if (!snapshot.exists()) return null;
  return parseSnapshot(snapshot.data());
};

export const writeCloudSave = async (
  uid: string,
  snapshot: MetaSnapshot,
): Promise<void> => {
  await setDoc(userDoc(uid), snapshot);
};
