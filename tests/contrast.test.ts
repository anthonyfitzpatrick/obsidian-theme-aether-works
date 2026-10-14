// Every text and background pairing the theme draws, checked against WCAG 2 in both modes.
// Gradients are checked at both ends, so text reads across the whole plate.
import assert from "node:assert/strict";
import { test } from "node:test";
import { contrastRatio, readPalette } from "./helpers.ts";

interface Mode {
  readonly name: string;
  readonly file: string;
}

/** Text tokens, the grounds they are drawn on, and the ratio they must reach. */
interface Pairing {
  readonly label: string;
  readonly inks: readonly string[];
  readonly grounds: readonly string[];
  readonly minimum: number;
}

const MODES: readonly Mode[] = [
  { name: "dark", file: "src/02-palette-dark.css" },
  { name: "light", file: "src/03-palette-light.css" },
];

const PAGE = ["parchment", "parchment-deep", "parchment-glow", "quote-bg", "table-alt", "form-field"];

const PAIRINGS: readonly Pairing[] = [
  { label: "body text on the page", inks: ["ink", "ink-muted", "link", "link-hover", "h1"], grounds: PAGE, minimum: 4.5 },
  { label: "faint text on the page (placeholders, metadata)", inks: ["ink-faint"], grounds: ["parchment", "parchment-deep"], minimum: 3 },
  { label: "signal colours on the page", inks: ["red", "blue", "purple", "pink", "cyan", "verdigris"], grounds: ["parchment"], minimum: 3 },
  { label: "sidebar text on leather", inks: ["on-leather", "on-leather-muted"], grounds: ["leather"], minimum: 4.5 },
  { label: "status bar, notices and tooltips", inks: ["on-desk"], grounds: ["leather-dark"], minimum: 4.5 },
  { label: "plaque lettering (tabs, tags, buttons, table heads)", inks: ["plaque-text"], grounds: ["plaque-top", "plaque-mid", "plaque-bottom"], minimum: 4.5 },
  { label: "highlighted text", inks: ["ink"], grounds: ["highlight-bg"], minimum: 4.5 },
  { label: "plate lettering (active file, callouts, warning buttons, settings)", inks: ["copper-text"], grounds: ["copper-top", "copper-mid", "copper-bottom", "wax-top", "wax-bottom", "iron-top", "iron-bottom", "verdigris"], minimum: 4.5 },
  { label: "primary buttons", inks: ["on-accent"], grounds: ["accent", "accent-hover"], minimum: 4.5 },
  { label: "code", inks: ["code-text", "code-comment", "code-keyword", "link", "red", "h1", "purple"], grounds: ["code-bg"], minimum: 4.5 },
  { label: "ribbon icons on their brass domes", inks: ["brass-shadow"], grounds: ["steel", "brass"], minimum: 3 },
];

for (const mode of MODES) {
  const palette = readPalette(mode.file);
  const colour = (token: string): string => {
    const value = palette.get(token);
    assert.ok(value !== undefined, `${mode.name}: --aw-${token} is missing`);
    return value;
  };

  for (const pairing of PAIRINGS) {
    test(`${mode.name}: ${pairing.label} reach ${pairing.minimum}:1`, () => {
      const failures: string[] = [];
      for (const ink of pairing.inks) {
        for (const ground of pairing.grounds) {
          const ratio = contrastRatio(colour(ink), colour(ground));
          if (ratio < pairing.minimum) failures.push(`--aw-${ink} on --aw-${ground} is ${ratio.toFixed(2)}:1`);
        }
      }
      assert.deepEqual(failures, []);
    });
  }
}

test("both palettes define the same tokens", () => {
  const [dark, light] = MODES.map((mode) => [...readPalette(mode.file).keys()].sort());
  assert.deepEqual(dark, light);
});
