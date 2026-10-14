// Obsidian's community theme requirements and the project's own packaging rules. Obsidian's
// CSS guidelines (variables, low specificity, no !important) are enforced by stylelint
// (.stylelintrc.json); these tests cover what a linter can't see.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { projectRoot, readManifest, readPackageInfo } from "../scripts/project.ts";
import { readProjectFile } from "./helpers.ts";

const css = readProjectFile("theme.css");

test("the repository root has the files Obsidian's directory requires", () => {
  for (const file of ["README.md", "LICENSE", "manifest.json", "theme.css", "screenshot.png"]) {
    assert.ok(existsSync(join(projectRoot, file)), `${file} is missing`);
  }
});

test("manifest.json has every required field and a semantic version matching package.json", () => {
  const manifest = readManifest();
  assert.equal(manifest.name, "Aether Works");
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.match(manifest.minAppVersion, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.version, readPackageInfo().version, "manifest and package.json versions differ");
});

test("screenshot.png is 512x288, the size the directory recommends", () => {
  const png = readFileSync(join(projectRoot, "screenshot.png"));
  // A PNG's IHDR chunk holds the width and height as big-endian integers at bytes 16 and 20.
  assert.equal(png.readUInt32BE(16), 512);
  assert.equal(png.readUInt32BE(20), 288);
});

test("theme.css defines both light and dark modes", () => {
  assert.match(css, /\.theme-dark\s*[,{]/);
  assert.match(css, /\.theme-light\s*[,{]/);
});

test("the licence is MIT", () => {
  assert.match(readProjectFile("LICENSE"), /^MIT License/);
  assert.equal(readPackageInfo().license, "MIT");
});

test("theme.css loads nothing from the network", () => {
  assert.doesNotMatch(css, /@import/);
  assert.doesNotMatch(css, /url\(\s*["']?(https?:)?\/\//);
});

test("theme.css stays under 600 KB, fonts included", () => {
  assert.ok(Buffer.byteLength(css) < 600_000, `theme.css is ${Buffer.byteLength(css)} bytes`);
});

// Obsidian's manifest rules for theme names: Basic Latin, no punctuation except hyphens,
// plus signs and parentheses, no "Obsidian" (or Obsi-/-sidian), and no word "Theme".
test("the theme name follows Obsidian's naming rules", () => {
  const name = readManifest().name;
  assert.match(name, /^[A-Za-z0-9 ()+-]+$/);
  assert.doesNotMatch(name, /obsi|sidian/i);
  assert.doesNotMatch(name, /\btheme\b/i);
});

// Obsidian's self-review checklist: no :has() (slow, especially in Canvas), and no vertical
// margins on live preview editor elements (padding instead).
test("theme.css uses no :has()", () => {
  assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ""), /:has\(/);
});

test("no vertical margins on live preview editor elements", () => {
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, selector = "", body = ""] of rules) {
    if (!/\.cm-|HyperMD|markdown-source-view|inline-title/.test(selector)) continue;
    assert.doesNotMatch(body, /\bmargin(?:-top|-bottom|-block[\w-]*)?\s*:\s*(?!0\b|0;)(?![^;]*\bauto\s*;)[^;]*/, `${selector.trim()} sets a vertical margin`);
  }
});
