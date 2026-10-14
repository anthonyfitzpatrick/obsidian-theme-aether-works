// CSS hygiene: every theme token that is read is defined, and every token that is defined is
// read. Catches typos that silently fall back to nothing, and dead tokens left behind.
import assert from "node:assert/strict";
import { test } from "node:test";
import { readSources } from "./helpers.ts";

const sources = readSources().replace(/\/\*[\s\S]*?\*\//g, "");

const defined = new Set([...sources.matchAll(/(--aw-[\w-]+)\s*:/g)].map((match) => match[1]));
// A token is read through var(), or, for the option switches, through a style() query.
const used = new Set([...sources.matchAll(/(?:var|style)\(\s*(--aw-[\w-]+)/g)].map((match) => match[1]));

test("every --aw-* token that is read is defined", () => {
  assert.deepEqual([...used].filter((token) => !defined.has(token)), []);
});

test("every --aw-* token that is defined is read", () => {
  assert.deepEqual([...defined].filter((token) => !used.has(token)), []);
});
