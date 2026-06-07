import { describe, expect, it } from "vitest";
import { SUPPORTED_LANGUAGES } from "./languages";

type Json = { [key: string]: string | Json };

const isJson = (value: unknown): value is Json => {
  if (typeof value !== "object" || value === null) return false;
  return Object.values(value).every(
    (entry) => typeof entry === "string" || isJson(entry),
  );
};

const modules = import.meta.glob<{ default: unknown }>("../locales/*/*.json", {
  eager: true,
});

interface LocaleFile {
  lang: string;
  namespace: string;
  data: Json;
}

const files: LocaleFile[] = [];
for (const [path, mod] of Object.entries(modules)) {
  const match = /\/locales\/([^/]+)\/([^/]+)\.json$/.exec(path);
  if (match === null) continue;
  const lang = match[1];
  const namespace = match[2];
  if (lang === undefined || namespace === undefined) continue;
  if (!isJson(mod.default)) continue;
  files.push({ lang, namespace, data: mod.default });
}

const flatten = (obj: Json, prefix = ""): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix === "" ? key : `${prefix}.${key}`;
    if (typeof value === "string") out[full] = value;
    else Object.assign(out, flatten(value, full));
  }
  return out;
};

const tokensOf = (text: string): string[] =>
  (text.match(/\{\{[^}]+\}\}/g) ?? []).slice().sort();

const langFolders = [...new Set(files.map((f) => f.lang))];
const enFiles = files.filter((f) => f.lang === "en");

describe("locales", () => {
  it("ships an en source folder", () => {
    expect(langFolders).toContain("en");
  });

  it("only contains supported language folders", () => {
    for (const folder of langFolders) {
      expect(SUPPORTED_LANGUAGES as readonly string[]).toContain(folder);
    }
  });

  it("every en value is a non-empty string", () => {
    for (const file of enFiles) {
      for (const [key, value] of Object.entries(flatten(file.data))) {
        expect(value.length, `en/${file.namespace}:${key}`).toBeGreaterThan(0);
      }
    }
  });

  it("translated values keep the same interpolation tokens as en", () => {
    for (const file of files) {
      if (file.lang === "en") continue;
      const enFile = enFiles.find((e) => e.namespace === file.namespace);
      if (enFile === undefined) continue;
      const enFlat = flatten(enFile.data);
      const targetFlat = flatten(file.data);
      for (const [key, enValue] of Object.entries(enFlat)) {
        const targetValue = targetFlat[key];
        if (targetValue === undefined) continue;
        expect(
          tokensOf(targetValue),
          `${file.lang}/${file.namespace}:${key}`,
        ).toEqual(tokensOf(enValue));
      }
    }
  });
});
