// The README and User Guide: every picture exists, every picture in docs/images is shown
// somewhere, and every picture has descriptive alt text and is followed by a caption that
// explains what it shows. Relative links resolve.
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { projectRoot } from "../scripts/project.ts";
import { readProjectFile } from "./helpers.ts";

const DOCS = ["README.md", "USERGUIDE.md"];
const IMAGE = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/;

interface Figure {
  readonly doc: string;
  readonly alt: string;
  readonly path: string;
  readonly caption: string;
}

function figures(doc: string): readonly Figure[] {
  const lines = readProjectFile(doc).split("\n");
  const found: Figure[] = [];
  lines.forEach((line, index) => {
    const match = IMAGE.exec(line);
    if (match === null) return;
    // The caption is the italic paragraph straight after the image, optionally continued by a
    // list of italic items ("- *…*") after a blank line.
    const block: string[] = [];
    let cursor = index + 1;
    while (cursor < lines.length && (lines[cursor] ?? "").trim() === "") cursor += 1;
    while (cursor < lines.length) {
      const next = (lines[cursor] ?? "").trim();
      const continuesAsList = next === "" && (lines[cursor + 1] ?? "").trim().startsWith("- *");
      if (next === "" && !continuesAsList) break;
      if (next !== "") block.push(next);
      cursor += 1;
    }
    found.push({ doc, alt: match[1] ?? "", path: match[2] ?? "", caption: block.join(" ") });
  });
  return found;
}

const all = DOCS.flatMap(figures);

test("every picture in the README and User Guide exists", () => {
  for (const figure of all) assert.ok(existsSync(join(projectRoot, figure.path)), `${figure.doc}: ${figure.path} is missing`);
});

test("every picture in docs/images is shown in the README or User Guide", () => {
  const shown = new Set(all.map((figure) => figure.path));
  for (const file of readdirSync(join(projectRoot, "docs/images"))) {
    assert.ok(shown.has(`docs/images/${file}`), `docs/images/${file} is never shown`);
  }
});

for (const figure of all) {
  test(`${figure.doc}: ${figure.path} has descriptive alt text and a full caption`, () => {
    assert.ok(figure.alt.length >= 80, `alt text is only ${figure.alt.length} characters: "${figure.alt}"`);
    assert.ok(figure.caption.startsWith("*"), `the paragraph after ${figure.path} is not an italic caption`);
    assert.ok(figure.caption.length >= 200, `the caption is only ${figure.caption.length} characters`);
  });
}

test("relative links in the README and User Guide resolve", () => {
  for (const doc of DOCS) {
    for (const [, target = ""] of readProjectFile(doc).matchAll(/\]\((?!https?:|#)([^)#]+)(?:#[^)]*)?\)/g)) {
      assert.ok(existsSync(join(projectRoot, target)), `${doc} links to ${target}, which doesn't exist`);
    }
  }
});

test("the User Guide's contents list matches its sections", () => {
  const guide = readProjectFile("USERGUIDE.md");
  const anchors = [...guide.matchAll(/^\d+\. \[[^\]]+\]\(#([^)]+)\)/gm)].map((match) => match[1]);
  const headings = [...guide.matchAll(/^## (.+)$/gm)]
    .map((match) => (match[1] ?? "").toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-"))
    .filter((slug) => slug !== "contents");
  assert.deepEqual(anchors, headings);
});
