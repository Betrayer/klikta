import { describe, expect, it } from "vitest";
import {
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  isSupportedLang,
} from "./languages";

describe("languages", () => {
  it("has a native label for every supported language", () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(LANGUAGE_LABELS[lang].length).toBeGreaterThan(0);
    }
  });

  it("accepts supported codes and rejects everything else", () => {
    expect(isSupportedLang("en")).toBe(true);
    expect(isSupportedLang("uk")).toBe(true);
    expect(isSupportedLang("xx")).toBe(false);
    expect(isSupportedLang(42)).toBe(false);
    expect(isSupportedLang(null)).toBe(false);
  });
});
