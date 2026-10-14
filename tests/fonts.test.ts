// The embedded typefaces: every file is registered, licensed, credited and used.
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { EMBEDDED_FACES, LICENCE_TEXTS } from "../scripts/fonts.ts";
import { projectRoot } from "../scripts/project.ts";
import { readProjectFile } from "./helpers.ts";

test("every font file in fonts/ is embedded, and every embedded face has a file", () => {
  const files = readdirSync(join(projectRoot, "fonts")).filter((file) => file.endsWith(".woff2"));
  assert.deepEqual([...new Set(EMBEDDED_FACES.map((face) => face.file))].sort(), files.sort());
});

test("each licence used by an embedded face has its full text in fonts/", () => {
  for (const face of EMBEDDED_FACES) {
    const path = LICENCE_TEXTS[face.licence];
    assert.ok(readProjectFile(path).length > 1000, `${path} looks incomplete`);
  }
});

test("fonts/README.md credits every embedded family", () => {
  const credits = readProjectFile("fonts/README.md");
  for (const face of EMBEDDED_FACES) assert.ok(credits.includes(face.designFamily), `${face.designFamily} is not credited`);
});

test("every embedded family is named by a font stack in src/", () => {
  const tokens = readProjectFile("src/01-tokens.css");
  for (const face of EMBEDDED_FACES) assert.ok(tokens.includes(`"${face.family}"`), `${face.family} is embedded but never used`);
});

// Obsidian installs only theme.css and manifest.json, so the fonts' licence and copyright
// notices must be inside theme.css itself, not just in the repository.
test("theme.css carries every embedded font's copyright notice and its full licence", () => {
  const css = readProjectFile("theme.css");
  for (const face of EMBEDDED_FACES) {
    const notices = readProjectFile(LICENCE_TEXTS[face.licence])
      .split("\n")
      .filter((line) => line.startsWith("Copyright"));
    for (const notice of notices) assert.ok(css.includes(notice), `theme.css lacks "${notice}"`);
  }
  assert.match(css, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(css, /PERMISSION & CONDITIONS/);
});
