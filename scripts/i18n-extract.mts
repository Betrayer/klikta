import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SKILL_TREE } from "../src/data/skillTree";
import { MODES } from "../src/data/modes";

type Entry = Record<string, string>;
type Namespace = Record<string, Entry>;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const enDir = resolve(scriptDir, "../src/locales/en");

const sortKeys = (value: Namespace): Namespace => {
  const sorted: Namespace = {};
  for (const key of Object.keys(value).sort()) {
    const entry = value[key];
    if (entry === undefined) continue;
    const sortedEntry: Entry = {};
    for (const field of Object.keys(entry).sort()) {
      const fieldValue = entry[field];
      if (fieldValue !== undefined) sortedEntry[field] = fieldValue;
    }
    sorted[key] = sortedEntry;
  }
  return sorted;
};

const writeNamespace = (name: string, data: Namespace): void => {
  const target = resolve(enDir, `${name}.json`);
  writeFileSync(target, `${JSON.stringify(sortKeys(data), null, 2)}\n`, "utf-8");
  console.log(`wrote ${name}.json (${Object.keys(data).length} entries)`);
};

const perks: Namespace = {};
for (const branch of SKILL_TREE) {
  perks[branch.id] = { name: branch.name, description: branch.description };
  for (const tier of branch.tiers) {
    for (const option of tier.options) {
      perks[option.id] = {
        name: option.name,
        description: option.description,
      };
    }
  }
}

const modes: Namespace = {};
for (const mode of MODES) {
  modes[mode.id] = {
    name: mode.name,
    tagline: mode.tagline,
    description: mode.description,
  };
}

writeNamespace("perks", perks);
writeNamespace("modes", modes);
