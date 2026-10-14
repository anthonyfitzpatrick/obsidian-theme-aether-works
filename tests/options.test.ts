// Every option works without any plugin and without style queries: each is a set of CSS
// variables the theme reads directly. A CSS snippet (Obsidian's own Appearance settings)
// sets them vault-wide, and in-note options have classes a note can list in cssclasses.
// Style Settings is an optional extra. That the snippets match scripts/options.ts is checked
// by `scripts/build.ts --check`.
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

// Obsidian's directory flags style queries as only partly supported by older versions.
test("theme.css uses no style queries", () => {
  assert.doesNotMatch(theme.replace(/\/\*[\s\S]*?\*\//g, ""), /@container[^{]*style\(/);
});

for (const option of THEME_OPTIONS) {
  test(`${option.title}: the snippet only sets variables on body`, () => {
    const rules = readProjectFile(join("snippets", snippetFileName(option)))
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .trim();
    assert.match(rules, /^body \{\n(  --[\w-]+: [^;]+;\n)+\}$/);
  });

  test(`${option.title}: each switch changes something the theme or Obsidian reads`, () => {
    for (const entry of option.switches) {
      assert.notEqual(entry.normal, entry.applied, `${entry.property} has the same value either way`);
      // The theme's own variables must be read in src/. The font slots (--font-*-theme,
      // --font-text-size) are Obsidian's own variables, read by Obsidian.
      if (entry.property.startsWith("--aw-")) {
        assert.match(sources, new RegExp(`var\\(\\s*${entry.property}\\b`), `${entry.property} is never read in src/`);
      }
    }
  });

  test(`${option.title}: theme.css carries its defaults and classes`, () => {
    for (const entry of option.switches) assert.ok(theme.includes(`${entry.property}: ${entry.normal};`), `${entry.property} has no default`);
    assert.ok(theme.includes(`.${option.applyClass} {`), `.${option.applyClass} is missing`);
    if (option.keepClass !== null) assert.ok(theme.includes(`.${option.keepClass} {`), `.${option.keepClass} is missing`);
  });
}

test("no switch variable is also set in src/, where it would fight the generated default", () => {
  for (const option of THEME_OPTIONS) {
    for (const entry of option.switches) {
      assert.doesNotMatch(sources.replace(/\/\*[\s\S]*?\*\//g, ""), new RegExp(`${entry.property}\\s*:`), `${entry.property} is also set in src/`);
    }
  }
});

test("no theme rule depends on a body class that only a plugin can add", () => {
  for (const option of THEME_OPTIONS) {
    assert.doesNotMatch(sources, new RegExp(`\\.${option.applyClass}\\b`), `src/ styles .${option.applyClass} directly`);
  }
});
