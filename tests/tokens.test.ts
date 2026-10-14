// CSS hygiene: every theme token that is read is defined, and every token that is defined is
// read. Catches typos that silently fall back to nothing, and dead tokens left behind. Reads the
// built theme.css, so the option defaults generated from scripts/options.ts count too.
import assert from "node:assert/strict";
import { test } from "node:test";
import { readProjectFile } from "./helpers.ts";

const sources = readProjectFile("theme.css").replace(/\/\*[\s\S]*?\*\//g, "");

const defined = new Set([...sources.matchAll(/(--aw-[\w-]+)\s*:/g)].map((match) => match[1]));
const used = new Set([...sources.matchAll(/var\(\s*(--aw-[\w-]+)/g)].map((match) => match[1]));

test("every --aw-* token that is read is defined", () => {
  assert.deepEqual([...used].filter((token) => !defined.has(token)), []);
});

test("every --aw-* token that is defined is read", () => {
  assert.deepEqual([...defined].filter((token) => !used.has(token)), []);
});
