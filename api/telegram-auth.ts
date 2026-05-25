import { createHmac } from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_AGE_SECONDS = 86400;

const readInitData = (body: unknown): string | null => {
  if (typeof body !== "object" || body === null) return null;
  const value = (body as { initData?: unknown }).initData;
  return typeof value === "string" && value.length > 0 ? value : null;
};

const validateInitData = (
  initData: string,
  botToken: string,
): URLSearchParams | null => {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (hash === null) {
    console.error("telegram-auth-nohash", {
      initDataLen: initData.length,
      keys: [...params.keys()],
    });
    return null;
  }
  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const checkString = (excludeSignature: boolean): string => {
    const pairs: string[] = [];
    for (const [key, value] of params.entries()) {
      if (key === "hash") continue;
      if (excludeSignature && key === "signature") continue;
      pairs.push(`${key}=${value}`);
    }
    pairs.sort();
    return pairs.join("\n");
  };
  const hmac = (data: string): string =>
    createHmac("sha256", secretKey).update(data).digest("hex");
  const withSignature = hmac(checkString(false));
  const withoutSignature = hmac(checkString(true));
  if (hash === withSignature || hash === withoutSignature) return params;
  console.error("telegram-auth-mismatch", {
    botId: botToken.split(":")[0],
    tokenLen: botToken.length,
    keys: [...params.keys()],
    hasSignature: params.get("signature") !== null,
    authDate: params.get("auth_date"),
    hashPrefix: hash.slice(0, 8),
    withSignaturePrefix: withSignature.slice(0, 8),
    withoutSignaturePrefix: withoutSignature.slice(0, 8),
  });
  return null;
};

const extractTelegramId = (params: URLSearchParams): number | null => {
  const userRaw = params.get("user");
  if (userRaw === null) return null;
  try {
    const parsed: unknown = JSON.parse(userRaw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as { id?: unknown }).id === "number"
    ) {
      return (parsed as { id: number }).id;
    }
  } catch {
    return null;
  }
  return null;
};

const ensureAdmin = (): void => {
  if (getApps().length > 0) return;
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
};

const deny = (res: VercelResponse, status: number, error: string): void => {
  console.error("telegram-auth", status, error);
  res.status(status).json({ error });
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== "POST") {
    deny(res, 405, "method-not-allowed");
    return;
  }
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!botToken) {
    deny(res, 500, "server-misconfigured");
    return;
  }
  const initData = readInitData(req.body);
  if (initData === null) {
    deny(res, 400, "missing-init-data");
    return;
  }
  const params = validateInitData(initData, botToken);
  if (params === null) {
    deny(res, 401, "invalid-init-data");
    return;
  }
  const authDate = Number(params.get("auth_date"));
  if (
    !Number.isFinite(authDate) ||
    Date.now() / 1000 - authDate > MAX_AGE_SECONDS
  ) {
    deny(res, 401, "stale-init-data");
    return;
  }
  const telegramId = extractTelegramId(params);
  if (telegramId === null) {
    deny(res, 401, "no-user");
    return;
  }
  try {
    ensureAdmin();
    const token = await getAuth().createCustomToken(`tg:${telegramId}`);
    res.status(200).json({ token });
  } catch (error) {
    console.error("telegram-auth", 500, "token-failed", error);
    res.status(500).json({ error: "token-failed" });
  }
}
