// Paths and the two metadata files the scripts and tests rely on, read once through the
// JSON boundary into named types.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { type JsonObject, parseJsonObject, readText } from "./json.ts";

export const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

export function readProjectFile(relativePath: string): string {
  return readFileSync(join(projectRoot, relativePath), "utf8");
}

/** The fields Obsidian's community theme directory requires in manifest.json. */
export interface ThemeManifest {
  readonly name: string;
  readonly version: string;
  readonly minAppVersion: string;
  readonly author: string;
  readonly authorUrl: string;
}

export interface PackageInfo {
  readonly version: string;
  readonly license: string;
}

function requireText(fields: JsonObject, key: string, file: string): string {
  const value = readText(fields, key);
  if (value === null) throw new Error(`${file} is missing a non-empty "${key}"`);
  return value;
}

export function readManifest(): ThemeManifest {
  const file = "manifest.json";
  const fields = parseJsonObject(readProjectFile(file), file);
  return {
    name: requireText(fields, "name", file),
    version: requireText(fields, "version", file),
    minAppVersion: requireText(fields, "minAppVersion", file),
    author: requireText(fields, "author", file),
    authorUrl: requireText(fields, "authorUrl", file),
  };
}

export function readPackageInfo(): PackageInfo {
  const file = "package.json";
  const fields = parseJsonObject(readProjectFile(file), file);
  return { version: requireText(fields, "version", file), license: requireText(fields, "license", file) };
}
