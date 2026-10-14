// Builds the distributable theme.css: the embedded typefaces, the option classes and the
// optional Style Settings block, then src/*.css in filename order. It also writes one CSS
// snippet per option to snippets/. --check fails if either is stale, so CI and the
// pre-commit hook catch hand edits.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EMBEDDED_FACES, type EmbeddedFace, LATIN_RANGE, LICENCE_TEXTS } from "./fonts.ts";
import { optionRules, snippetCss, snippetFileName, styleSettingsBlock, THEME_OPTIONS } from "./options.ts";
import { projectRoot } from "./project.ts";

const sourceDir = join(projectRoot, "src");
const fontDir = join(projectRoot, "fonts");
const outputPath = join(projectRoot, "theme.css");
const snippetDir = join(projectRoot, "snippets");

function fontFaceRule(face: EmbeddedFace): string {
  const data = readFileSync(join(fontDir, face.file)).toString("base64");
  return [
    "@font-face {",
    `  font-family: "${face.family}";`,
    `  font-style: ${face.style};`,
    `  font-weight: ${face.weight};`,
    "  font-display: swap;",
    `  src: url("data:font/woff2;base64,${data}") format("woff2");`,
    `  unicode-range: ${LATIN_RANGE};`,
    "}",
  ].join("\n");
}

const modules = readdirSync(sourceDir)
  .filter((file) => file.endsWith(".css"))
  .sort();
const banner = "/* Aether Works for Obsidian. Generated from src/ and fonts/ by scripts/build.ts. Do not edit directly. */\n\n";
const credits = [...new Set(EMBEDDED_FACES.map((face) => `${face.designFamily} (${face.licence})`))];
// The OFL requires each copy of the fonts to carry their copyright notices and the licence.
// Obsidian installs only theme.css and manifest.json, so the full text travels in here.
const licenceTexts = [...new Set(EMBEDDED_FACES.map((face) => LICENCE_TEXTS[face.licence]))].map((path) =>
  readFileSync(join(projectRoot, path), "utf8").trim().replaceAll("*/", "* /"),
);
const fonts =
  `/* Embedded typefaces, Latin subsets: ${credits.join("; ")}.\n\n${licenceTexts.join("\n\n")}\n*/\n` +
  EMBEDDED_FACES.map(fontFaceRule).join("\n") +
  "\n\n";
const options =
  "/* Options: the variables the theme reads, with their defaults. The classes below apply an\n" +
  "   option to a note (its cssclasses property) or, through the optional Style Settings\n" +
  "   plugin, to the vault. The CSS snippets in snippets/ do it vault-wide with no plugin. */\n" +
  optionRules() +
  "\n\n" +
  styleSettingsBlock() +
  "\n\n";
const css = banner + fonts + options + modules.map((file) => `${readFileSync(join(sourceDir, file), "utf8").trimEnd()}\n`).join("\n");

const snippets = new Map(THEME_OPTIONS.map((option) => [snippetFileName(option), snippetCss(option)]));

function isCurrent(path: string, text: string): boolean {
  return existsSync(path) && readFileSync(path, "utf8") === text;
}

/** Every generated file that differs from what the build would write, and any leftovers. */
function staleOutputs(): readonly string[] {
  const present = existsSync(snippetDir) ? readdirSync(snippetDir) : [];
  const stale = present.filter((file) => !snippets.has(file)).map((file) => `snippets/${file}`);
  for (const [file, text] of snippets) if (!isCurrent(join(snippetDir, file), text)) stale.push(`snippets/${file}`);
  if (!isCurrent(outputPath, css)) stale.push("theme.css");
  return stale;
}

if (process.argv.includes("--check")) {
  const stale = staleOutputs();
  if (stale.length > 0) {
    console.error(`Out of date: ${stale.join(", ")}. Run \`npm run build\`.`);
    process.exit(1);
  }
  console.log(`theme.css and ${snippets.size} snippets are current (${modules.length} modules, ${EMBEDDED_FACES.length} faces).`);
} else {
  writeFileSync(outputPath, css);
  rmSync(snippetDir, { recursive: true, force: true });
  mkdirSync(snippetDir);
  for (const [file, text] of snippets) writeFileSync(join(snippetDir, file), text);
  console.log(`Built theme.css from ${modules.length} modules and ${EMBEDDED_FACES.length} faces, and ${snippets.size} snippets.`);
}
