// Copies the distributable files into a vault's theme folder, and the option snippets into
// its snippets folder (they arrive switched off; Obsidian lists them under Appearance).
// Snippets carrying the theme's prefix that no longer exist, after an option is renamed or
// dropped, are removed; the vault's other snippets are never touched.
// Usage: AETHER_WORKS_VAULT=/path/to/vault npm run deploy
import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { SNIPPET_PREFIX } from "./options.ts";
import { projectRoot, readManifest } from "./project.ts";

const vaultPath = process.env["AETHER_WORKS_VAULT"] ?? process.argv[2];
if (vaultPath === undefined || vaultPath === "") {
  console.error("Set AETHER_WORKS_VAULT or pass the vault path as an argument.");
  process.exit(1);
}

// Obsidian matches a theme by folder name, which must equal the manifest name.
const themeFolder = join(vaultPath, ".obsidian", "themes", readManifest().name);
mkdirSync(themeFolder, { recursive: true });
for (const file of ["manifest.json", "theme.css"]) copyFileSync(join(projectRoot, file), join(themeFolder, file));
const snippetFolder = join(vaultPath, ".obsidian", "snippets");
mkdirSync(snippetFolder, { recursive: true });
const snippets = readdirSync(join(projectRoot, "snippets"));
const retired = readdirSync(snippetFolder).filter((file) => file.startsWith(SNIPPET_PREFIX) && !snippets.includes(file));
for (const file of retired) rmSync(join(snippetFolder, file));
for (const file of snippets) copyFileSync(join(projectRoot, "snippets", file), join(snippetFolder, file));
if (retired.length > 0) console.log(`Removed retired snippets: ${retired.join(", ")}`);
console.log(`Deployed to ${themeFolder}, with ${snippets.length} snippets in ${snippetFolder}`);
