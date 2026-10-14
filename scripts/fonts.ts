// The typefaces the theme embeds. Obsidian's guidelines forbid loading remote assets, so
// the Latin subset of each face is inlined into theme.css as a data: URI at build time.
// Every file here is the unmodified Google Fonts distribution; licences are in fonts/.

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
}

export const EMBEDDED_FACES: readonly EmbeddedFace[] = [
  { family: "Aether Playfair", designFamily: "Playfair Display", file: "playfair-display-latin.woff2", style: "normal", weight: "400 900", licence: "OFL-1.1" },
  { family: "Aether Fell", designFamily: "IM Fell English", file: "im-fell-english-latin.woff2", style: "normal", weight: "400", licence: "OFL-1.1" },
  { family: "Aether Fell", designFamily: "IM Fell English", file: "im-fell-english-italic-latin.woff2", style: "italic", weight: "400", licence: "OFL-1.1" },
  { family: "Aether Cinzel", designFamily: "Cinzel", file: "cinzel-latin.woff2", style: "normal", weight: "400 900", licence: "OFL-1.1" },
  // A typewriter face: Cutive Mono draws on the Smith Premier, a typewriter first made in 1889.
  { family: "Aether Typewriter", designFamily: "Cutive Mono", file: "cutive-mono-latin.woff2", style: "normal", weight: "400", licence: "OFL-1.1" },
];

/** The Latin range Google Fonts serves in its "latin" subset. */
export const LATIN_RANGE =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
