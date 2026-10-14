// The typefaces the theme embeds. Obsidian's guidelines forbid loading remote assets, so the
// Latin subset of each face is inlined as a data: URI at build time. Every file here is the
// unmodified Google Fonts distribution; licences are in fonts/.
//
// Obsidian's directory warns when theme.css is large, so only the small typewriter face ships
// in theme.css. The larger period faces ship in an optional CSS snippet ("Period typefaces");
// without it the theme uses period-style serifs already installed on the system.

export type FontLicence = "OFL-1.1";

/** Where each licence's full text lives in the repository. */
export const LICENCE_TEXTS: Readonly<Record<FontLicence, string>> = {
  "OFL-1.1": "fonts/OFL.txt",
};

export interface EmbeddedFace {
  /** The alias the theme declares, so it never clashes with an installed copy. */
  readonly family: string;
  /** The typeface's published name, for credits. */
  readonly designFamily: string;
  readonly file: string;
  readonly style: "normal" | "italic";
  /** A single weight, or the "min max" range of a variable face. */
  readonly weight: string;
  readonly licence: FontLicence;
  /** Where the face is embedded: theme.css itself, or the optional period-typefaces snippet. */
  readonly bundle: "theme" | "snippet";
}

export const EMBEDDED_FACES: readonly EmbeddedFace[] = [
  { family: "Aether Playfair", designFamily: "Playfair Display", file: "playfair-display-latin.woff2", style: "normal", weight: "400 900", licence: "OFL-1.1", bundle: "snippet" },
  { family: "Aether Fell", designFamily: "IM Fell English", file: "im-fell-english-latin.woff2", style: "normal", weight: "400", licence: "OFL-1.1", bundle: "snippet" },
  { family: "Aether Fell", designFamily: "IM Fell English", file: "im-fell-english-italic-latin.woff2", style: "italic", weight: "400", licence: "OFL-1.1", bundle: "snippet" },
  { family: "Aether Cinzel", designFamily: "Cinzel", file: "cinzel-latin.woff2", style: "normal", weight: "400 900", licence: "OFL-1.1", bundle: "snippet" },
  // A typewriter face: Cutive Mono draws on the Smith Premier, a typewriter first made in 1889.
  { family: "Aether Typewriter", designFamily: "Cutive Mono", file: "cutive-mono-latin.woff2", style: "normal", weight: "400", licence: "OFL-1.1", bundle: "theme" },
];

/** The period-typefaces snippet: its file name and the font stacks it puts the embedded
 *  faces at the front of. The theme's own stacks (--aw-system-*) stay as the fallback. */
export const PERIOD_SNIPPET_TITLE = "Period typefaces";

export interface FaceStack {
  readonly property: string;
  readonly value: string;
}

export const PERIOD_STACKS: readonly FaceStack[] = [
  { property: "--aw-face-heading", value: '"Aether Playfair", var(--aw-system-heading)' },
  { property: "--aw-face-body", value: '"Aether Fell", var(--aw-system-body)' },
  { property: "--aw-face-plaque", value: '"Aether Cinzel", var(--aw-system-plaque)' },
];

/** The Latin range Google Fonts serves in its "latin" subset. */
export const LATIN_RANGE =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
