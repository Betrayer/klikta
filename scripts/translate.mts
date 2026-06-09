import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as deepl from "deepl-node";
import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env.local") });

const scriptDir = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(scriptDir, "../src/locales");
const enDir = resolve(localesDir, "en");

const TARGETS: ReadonlyArray<{
  folder: string;
  deepl: deepl.TargetLanguageCode;
  name: string;
}> = [
  { folder: "uk", deepl: "uk", name: "Ukrainian" },
  { folder: "de", deepl: "de", name: "German" },
  { folder: "fr", deepl: "fr", name: "French" },
  { folder: "es", deepl: "es", name: "Spanish" },
  { folder: "pl", deepl: "pl", name: "Polish" },
];

const DEEPL_NAMESPACES = new Set([
  "common",
  "menu",
  "game",
  "summary",
  "leaderboard",
  "settings",
  "auth",
]);
const LLM_NAMESPACES = new Set(["perks", "modes"]);

const DEEPL_BATCH = 50;
const LLM_BATCH = 30;
const LLM_MODEL = "claude-sonnet-4-6";

type NestedJson = { [key: string]: string | NestedJson };

const flatten = (obj: NestedJson, prefix = ""): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix === "" ? key : `${prefix}.${key}`;
    if (typeof value === "string") result[fullKey] = value;
    else Object.assign(result, flatten(value, fullKey));
  }
  return result;
};

const unflatten = (flat: Record<string, string>): NestedJson => {
  const result: NestedJson = {};
  for (const key of Object.keys(flat).sort()) {
    const value = flat[key];
    if (value === undefined) continue;
    const parts = key.split(".");
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (part === undefined) continue;
      const next = current[part];
      if (typeof next !== "object" || next === null) current[part] = {};
      current = current[part] as NestedJson;
    }
    const leaf = parts[parts.length - 1];
    if (leaf !== undefined) current[leaf] = value;
  }
  return result;
};

const loadJson = (filePath: string): NestedJson => {
  if (!existsSync(filePath)) return {};
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as NestedJson;
  } catch {
    return {};
  }
};

const saveJson = (filePath: string, data: NestedJson): void => {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
};

const chunk = <T,>(items: readonly T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const wrapTokens = (text: string): string =>
  text.replace(/(\{\{[^}]+\}\})/g, "<x>$1</x>");

const unwrapTokens = (text: string): string => text.replace(/<\/?x>/g, "");

const translateBatchDeepl = async (
  translator: deepl.Translator,
  texts: readonly string[],
  target: deepl.TargetLanguageCode,
): Promise<string[]> => {
  const out: string[] = [];
  for (const part of chunk(texts, DEEPL_BATCH)) {
    const wrapped = part.map(wrapTokens);
    const results = await translator.translateText(wrapped, "en", target, {
      tagHandling: "xml",
      ignoreTags: ["x"],
    });
    for (const r of results) out.push(unwrapTokens(r.text));
  }
  return out;
};

const stripFences = (text: string): string =>
  text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

const translateBatchLlm = async (
  client: Anthropic,
  texts: readonly string[],
  languageName: string,
): Promise<string[]> => {
  const out: string[] = [];
  for (const part of chunk(texts, LLM_BATCH)) {
    const system =
      `You are a game localizer. Translate the given English strings into ${languageName}. ` +
      `These are names and descriptions of perks and modes in a fast neon arcade roguelite; ` +
      `keep the punchy game tone, keep them concise. ` +
      `Never translate or alter placeholders written as {{name}} - keep them verbatim. ` +
      `Preserve any leading symbols (like # or %). ` +
      `Return ONLY a JSON array of strings, same length and order as the input, no commentary.`;
    const resp = await client.messages.create({
      model: LLM_MODEL,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: JSON.stringify(part) }],
    });
    const block = resp.content.find((b) => b.type === "text");
    if (block === undefined || block.type !== "text") {
      throw new Error("LLM returned no text block");
    }
    const parsed: unknown = JSON.parse(stripFences(block.text));
    if (!Array.isArray(parsed) || parsed.length !== part.length) {
      throw new Error(
        `LLM array length mismatch: got ${Array.isArray(parsed) ? parsed.length : "non-array"}, expected ${part.length}`,
      );
    }
    for (const value of parsed) {
      out.push(typeof value === "string" ? value : "");
    }
  }
  return out;
};

const main = async (): Promise<void> => {
  const deeplKey = process.env.DEEPL_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const translator = deeplKey !== undefined ? new deepl.Translator(deeplKey) : null;
  const anthropic =
    anthropicKey !== undefined ? new Anthropic({ apiKey: anthropicKey }) : null;

  if (translator === null) console.warn("DEEPL_API_KEY missing - DeepL namespaces skipped.");
  if (anthropic === null) console.warn("ANTHROPIC_API_KEY missing - LLM namespaces skipped.");

  const namespaceFiles = readdirSync(enDir).filter((f) => f.endsWith(".json"));
  const enFlat: Record<string, Record<string, string>> = {};
  for (const file of namespaceFiles) {
    const ns = file.replace(/\.json$/, "");
    enFlat[ns] = flatten(loadJson(resolve(enDir, file)));
  }

  for (const target of TARGETS) {
    console.log(`\n[${target.folder}] ${target.name}`);
    for (const file of namespaceFiles) {
      const ns = file.replace(/\.json$/, "");
      const source = enFlat[ns];
      if (source === undefined) continue;

      const useDeepl = DEEPL_NAMESPACES.has(ns);
      const useLlm = LLM_NAMESPACES.has(ns);
      if (!useDeepl && !useLlm) continue;
      if (useDeepl && translator === null) continue;
      if (useLlm && anthropic === null) continue;

      const targetPath = resolve(localesDir, target.folder, file);
      const existing = flatten(loadJson(targetPath));

      const missingKeys = Object.keys(source).filter((k) => existing[k] === undefined);
      if (missingKeys.length === 0) continue;

      const sourceTexts = missingKeys.map((k) => source[k] ?? "");
      console.log(`  ${ns}: ${missingKeys.length} keys via ${useDeepl ? "DeepL" : "LLM"}`);

      let translated: string[];
      try {
        translated =
          useDeepl && translator !== null
            ? await translateBatchDeepl(translator, sourceTexts, target.deepl)
            : await translateBatchLlm(anthropic!, sourceTexts, target.name);
      } catch (error) {
        console.error(`  ${ns} failed:`, error instanceof Error ? error.message : error);
        continue;
      }

      const merged: Record<string, string> = { ...existing };
      missingKeys.forEach((key, i) => {
        const value = translated[i];
        if (value !== undefined && value !== "") merged[key] = value;
      });
      saveJson(targetPath, unflatten(merged));
    }
  }

  console.log("\nTranslation complete.");
};

void main();
