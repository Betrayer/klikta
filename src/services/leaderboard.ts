import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db, ensureAuth } from "./firebase";
import { useAuthStore } from "../state/authStore";
import { getTelegramSession } from "./telegram";
import { MODE_BY_ID, type ModeId } from "../data/modes";

export const SCORE_SCHEMA_VERSION = "p4";

const TOP_LIMIT = 50;
const CACHE_TTL_MS = 60000;
const MAX_VALUE = 100000000;
const MIN_RUN_MS = 2000;
const MAX_NAME_LENGTH = 24;
const MIN_PRINTABLE_CODE = 32;
const DELETE_CODE = 127;

export interface ScoreMeta {
  durationMs: number;
  maxCombo: number;
  build: string[];
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  value: number;
  maxCombo: number;
}

export type SubmitStatus = "submitted" | "not-best" | "skipped" | "failed";

export interface SubmitResult {
  status: SubmitStatus;
  rank: number | null;
}

interface CacheEntry {
  entries: LeaderboardEntry[];
  at: number;
}

const topCache = new Map<ModeId, CacheEntry>();

export const getLeaderboardValue = (
  mode: ModeId,
  run: { score: number; durationMs: number },
): number =>
  MODE_BY_ID[mode].leaderboardSort === "duration_desc"
    ? run.durationMs
    : run.score;

const fallbackName = (uid: string): string =>
  `Player${uid.slice(0, 4).toUpperCase()}`;

const stripControlChars = (name: string): string => {
  let result = "";
  for (const char of name) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= MIN_PRINTABLE_CODE && code !== DELETE_CODE) result += char;
  }
  return result;
};

export const sanitizeDisplayName = (name: string): string => {
  const cleaned = stripControlChars(name).trim().slice(0, MAX_NAME_LENGTH);
  return cleaned.length > 0 ? cleaned : "Player";
};

interface Identity {
  uid: string;
  displayName: string;
}

const resolveIdentity = async (): Promise<Identity> => {
  const account = useAuthStore.getState().account;
  if (account !== null && !account.isAnonymous) {
    return { uid: account.uid, displayName: account.displayName };
  }
  const uid = await ensureAuth();
  const telegramName = getTelegramSession().firstName;
  if (telegramName !== null && telegramName.trim().length > 0) {
    return { uid, displayName: sanitizeDisplayName(telegramName) };
  }
  const name = auth.currentUser?.displayName ?? fallbackName(uid);
  return { uid, displayName: name };
};

const scoresCollection = (mode: ModeId) =>
  collection(db, "leaderboards", mode, "scores");

const scoreDoc = (mode: ModeId, uid: string) =>
  doc(db, "leaderboards", mode, "scores", uid);

const toNumber = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const toStringValue = (value: unknown): string =>
  typeof value === "string" ? value : "";

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

const readValue = (data: unknown): number => toNumber(asRecord(data).value);

const parseEntry = (uid: string, data: unknown): LeaderboardEntry => {
  const record = asRecord(data);
  const meta = asRecord(record.meta);
  return {
    uid,
    displayName: sanitizeDisplayName(toStringValue(record.displayName)),
    value: toNumber(record.value),
    maxCombo: toNumber(meta.maxCombo),
  };
};

export const getPlayerRank = async (
  mode: ModeId,
  value: number,
): Promise<number> => {
  const higher = query(scoresCollection(mode), where("value", ">", value));
  const snapshot = await getCountFromServer(higher);
  return snapshot.data().count + 1;
};

export const getTopScores = async (
  mode: ModeId,
  force = false,
): Promise<LeaderboardEntry[]> => {
  const cached = topCache.get(mode);
  if (!force && cached !== undefined && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.entries;
  }
  const top = query(
    scoresCollection(mode),
    orderBy("value", "desc"),
    limit(TOP_LIMIT),
  );
  const snapshot = await getDocs(top);
  const entries = snapshot.docs.map((entry) =>
    parseEntry(entry.id, entry.data()),
  );
  topCache.set(mode, { entries, at: Date.now() });
  return entries;
};

export const submitScore = async (
  mode: ModeId,
  value: number,
  meta: ScoreMeta,
): Promise<SubmitResult> => {
  if (value <= 0 || value >= MAX_VALUE || meta.durationMs < MIN_RUN_MS) {
    return { status: "skipped", rank: null };
  }
  try {
    const identity = await resolveIdentity();
    const ref = scoreDoc(mode, identity.uid);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      const previous = readValue(existing.data());
      if (previous >= value) {
        return { status: "not-best", rank: await getPlayerRank(mode, previous) };
      }
    }
    await setDoc(ref, {
      uid: identity.uid,
      displayName: sanitizeDisplayName(identity.displayName),
      value,
      mode,
      achievedAt: serverTimestamp(),
      meta: {
        durationMs: Math.round(meta.durationMs),
        maxCombo: meta.maxCombo,
        build: meta.build,
        version: SCORE_SCHEMA_VERSION,
      },
    });
    topCache.delete(mode);
    return { status: "submitted", rank: await getPlayerRank(mode, value) };
  } catch (error) {
    console.warn("leaderboard submit failed", error);
    return { status: "failed", rank: null };
  }
};
