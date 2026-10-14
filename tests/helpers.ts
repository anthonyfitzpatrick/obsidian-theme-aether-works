// Shared by the tests: reading the CSS sources, palette parsing and WCAG contrast arithmetic.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { projectRoot, readProjectFile } from "../scripts/project.ts";

export { readProjectFile };

/** Every src/ module, concatenated in build order. */
export function readSources(): string {
  return readdirSync(join(projectRoot, "src"))
    .filter((file) => file.endsWith(".css"))
    .sort()
    .map((file) => readProjectFile(join("src", file)))
    .join("\n");
}

/** A palette module's solid colours: its `--aw-*` hex tokens, by name without the prefix. */
export type Palette = ReadonlyMap<string, string>;

const HEX_TOKEN = /--aw-([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi;

export function readPalette(relativePath: string): Palette {
  const palette = new Map<string, string>();
  for (const [, name, value] of readProjectFile(relativePath).matchAll(HEX_TOKEN)) {
    if (name !== undefined && value !== undefined) palette.set(name, value.toLowerCase());
  }
  return palette;
}

/** One sRGB channel (0–255) in linear light, per WCAG 2. */
function linear(channel: number): number {
  const unit = channel / 255;
  return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const channel = (offset: number): number => linear(Number.parseInt(hex.slice(offset, offset + 2), 16));
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** WCAG 2 contrast ratio between two hex colours, from 1 to 21. */
export function contrastRatio(first: string, second: string): number {
  const one = relativeLuminance(first);
  const other = relativeLuminance(second);
  return (Math.max(one, other) + 0.05) / (Math.min(one, other) + 0.05);
}
