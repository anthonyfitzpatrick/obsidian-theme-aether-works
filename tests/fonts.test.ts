// The embedded typefaces: every file is registered, licensed, credited and used.
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { EMBEDDED_FACES, LICENCE_TEXTS, PERIOD_SNIPPET_TITLE, PERIOD_STACKS } from "../scripts/fonts.ts";
import { SNIPPET_PREFIX } from "../scripts/options.ts";
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

test("every face is named where it ships: theme faces in src/, snippet faces in the snippet's stacks", () => {
  const tokens = readProjectFile("src/01-tokens.css");
  const stacks = PERIOD_STACKS.map((stack) => stack.value).join("\n");
  for (const face of EMBEDDED_FACES) {
    const where = face.bundle === "theme" ? tokens : stacks;
    assert.ok(where.includes(`"${face.family}"`), `${face.family} is embedded in the ${face.bundle} but never used there`);
  }
});

// Obsidian installs only theme.css and manifest.json, and a snippet is copied on its own, so
// each file that embeds a font must carry the fonts' copyright notices and the full licence.
test("theme.css and the period snippet each carry every copyright notice and the full OFL", () => {
  const notices = readProjectFile(LICENCE_TEXTS["OFL-1.1"])
    .split("\n")
    .filter((line) => line.startsWith("Copyright"));
  for (const file of ["theme.css", `snippets/${SNIPPET_PREFIX}${PERIOD_SNIPPET_TITLE}.css`]) {
    const text = readProjectFile(file);
    for (const notice of notices) assert.ok(text.includes(notice), `${file} lacks "${notice}"`);
    assert.match(text, /SIL OPEN FONT LICENSE Version 1\.1/, file);
    assert.match(text, /PERMISSION & CONDITIONS/, file);
  }
});

test("only the theme's own faces are embedded in theme.css", () => {
  const css = readProjectFile("theme.css");
  for (const face of EMBEDDED_FACES) {
    const embedded = css.includes(`font-family: "${face.family}";`);
    assert.equal(embedded, face.bundle === "theme", `${face.family} ${embedded ? "is" : "isn't"} embedded in theme.css`);
  }
});
