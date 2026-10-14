// Every option works without any plugin: each has a CSS snippet (Obsidian's own Appearance
// settings) that sets variables the theme actually reads, and in-note options have the
// classes a note can list in cssclasses. Style Settings is an optional extra on top.
// That the snippets match scripts/options.ts is checked by `scripts/build.ts --check`.
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { snippetFileName, THEME_OPTIONS } from "../scripts/options.ts";
import { projectRoot } from "../scripts/project.ts";
import { readProjectFile, readSources } from "./helpers.ts";

const sources = readSources();
const theme = readProjectFile("theme.css");

test("snippets/ holds exactly one snippet per option", () => {
  assert.deepEqual(readdirSync(join(projectRoot, "snippets")).sort(), THEME_OPTIONS.map(snippetFileName).sort());
});

for (const option of THEME_OPTIONS) {
  test(`${option.title}: the snippet only sets variables on body`, () => {
    const rules = readProjectFile(join("snippets", snippetFileName(option)))
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .trim();
    assert.match(rules, /^body \{\n(  --[\w-]+: [^;]+;\n)+\}$/);
  });

  // The theme's own variables must be read in src/. Obsidian's variables (the font slots)
  // are read by Obsidian; for those, the theme must be the one setting them, so the
  // snippet overrides a real theme choice.
  test(`${option.title}: every variable it sets is read by the theme or set by it for Obsidian`, () => {
    for (const declaration of option.declarations) {
      const name = declaration.property.replace(/^--/, "");
      const pattern = name.startsWith("aw-") ? new RegExp(`(?:var|style)\\(\\s*--${name}\\b`) : new RegExp(`--${name}\\s*:`);
      assert.match(sources, pattern, `${declaration.property} is neither read nor set in src/`);
    }
  });

  test(`${option.title}: theme.css carries its classes for cssclasses and Style Settings`, () => {
    assert.ok(theme.includes(`.${option.applyClass} {`), `.${option.applyClass} is missing`);
    if (option.keepClass !== null) assert.ok(theme.includes(`.${option.keepClass} {`), `.${option.keepClass} is missing`);
  });
}

test("every on/off switch is honoured in src/ through a style query", () => {
  for (const option of THEME_OPTIONS) {
    for (const declaration of option.declarations.filter((entry) => entry.value === "off")) {
      assert.ok(sources.includes(`style(${declaration.property}: off)`), `${declaration.property}: off is never queried`);
    }
  }
});

test("no theme rule depends on a body class that only a plugin can add", () => {
  for (const option of THEME_OPTIONS) {
    assert.doesNotMatch(sources, new RegExp(`\\.${option.applyClass}\\b`), `src/ styles .${option.applyClass} directly`);
  }
});
