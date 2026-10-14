// The theme's options, defined once. Each option is a set of CSS variables the theme reads,
// with their normal values and their values when the option is applied. Nothing here needs a
// plugin, and nothing needs a style query: the theme reads the variables directly.
// scripts/build.ts turns this list into
//   - the defaults, on body, in theme.css,
//   - a CSS snippet per option in snippets/ that applies it vault-wide (Settings →
//     Appearance → CSS snippets, built into Obsidian),
//   - a class a note can list in its cssclasses property to apply it to that note, and for
//     ornaments drawn inside a note, a class that keeps the ornament while the snippet is on,
//   - a Style Settings switch, for people who happen to have that plugin.

/** A variable the theme reads: its normal value, and its value with the option applied. */
export interface Switch {
  readonly property: string;
  readonly normal: string;
  readonly applied: string;
}

export interface ThemeOption {
  /** The snippet name and Style Settings label. */
  readonly title: string;
  readonly description: string;
  /** Class that applies the option: Style Settings puts it on body, a note lists it in cssclasses. */
  readonly applyClass: string;
  /** For an ornament drawn inside the note: the class a note lists to keep the ornament while
   *  the option is applied vault-wide. It restores the normal values. Null otherwise. */
  readonly keepClass: string | null;
  readonly switches: readonly Switch[];
}

export const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    title: "Use Obsidian's fonts",
    description: "Replace the embedded Victorian typefaces with the fonts chosen under Settings, Appearance.",
    applyClass: "aw-plain-fonts",
    keepClass: null,
    switches: [
      { property: "--aw-font-heading", normal: "var(--aw-face-heading)", applied: "var(--font-text)" },
      { property: "--aw-font-plaque", normal: "var(--aw-face-plaque)", applied: "var(--font-interface)" },
      { property: "--font-interface-theme", normal: "var(--aw-face-body)", applied: "var(--font-default)" },
      { property: "--font-text-theme", normal: "var(--aw-face-body)", applied: "var(--font-default)" },
      { property: "--font-monospace-theme", normal: "var(--aw-face-mono)", applied: "var(--font-monospace-default)" },
      { property: "--font-text-size", normal: "17px", applied: "16px" },
    ],
  },
  {
    title: "Plain leather",
    description: "Flat colours instead of the leather grain and damask patterns.",
    applyClass: "aw-no-textures",
    keepClass: null,
    switches: [
      { property: "--aw-leather-grain", normal: "var(--aw-leather-pattern)", applied: "none" },
      { property: "--aw-damask", normal: "var(--aw-damask-pattern)", applied: "none" },
    ],
  },
  {
    title: "No stitching",
    description: "Remove the running stitch around the sidebars and drawers.",
    applyClass: "aw-no-stitching",
    keepClass: null,
    switches: [{ property: "--aw-stitch", normal: '""', applied: "none" }],
  },
  {
    title: "No Roman numerals",
    description: "Stop numbering second-level headings and outline entries.",
    applyClass: "aw-no-numerals",
    keepClass: "aw-numerals",
    switches: [
      { property: "--aw-h2-numeral", normal: 'counter(aw-h2, upper-roman) "."', applied: "none" },
      { property: "--aw-outline-numeral", normal: 'counter(aw-section, upper-roman) ". "', applied: "none" },
    ],
  },
  {
    title: "Plain bullets",
    description: "Use ordinary bullets instead of fleurons.",
    applyClass: "aw-plain-bullets",
    keepClass: "aw-fleurons",
    switches: [
      { property: "--aw-bullet", normal: '"❧"', applied: '""' },
      { property: "--aw-bullet-size", normal: "auto", applied: "var(--list-bullet-size)" },
      { property: "--aw-bullet-radius", normal: "0", applied: "50%" },
      { property: "--aw-bullet-fill", normal: "none", applied: "var(--aw-copper)" },
      { property: "--aw-bullet-nudge", normal: "translateX(-0.35em)", applied: "none" },
    ],
  },
  {
    title: "Plain title",
    description: "A left-aligned note title, without the kicker and flourish.",
    applyClass: "aw-plain-title",
    keepClass: "aw-title-ornament",
    switches: [
      { property: "--aw-title-align", normal: "center", applied: "start" },
      { property: "--aw-title-kicker", normal: '"— ✦ —"', applied: "none" },
      { property: "--aw-title-flourish", normal: '""', applied: "none" },
    ],
  },
];

/** The prefix every generated snippet shares; deploy uses it to find the theme's own files. */
export const SNIPPET_PREFIX = "Aether Works - ";

/** The file name Obsidian shows in its CSS snippets list. */
export function snippetFileName(option: ThemeOption): string {
  return `${SNIPPET_PREFIX}${option.title}.css`;
}

function block(selector: string, lines: readonly string[]): string {
  return `${selector} {\n${lines.map((line) => `  ${line}`).join("\n")}\n}`;
}

function normalValues(option: ThemeOption): readonly string[] {
  return option.switches.map((entry) => `${entry.property}: ${entry.normal};`);
}

function appliedValues(option: ThemeOption): readonly string[] {
  return option.switches.map((entry) => `${entry.property}: ${entry.applied};`);
}

/** The snippet that applies an option vault-wide. */
export function snippetCss(option: ThemeOption): string {
  const keep =
    option.keepClass === null
      ? ""
      : `\n   With this snippet on, a note keeps the ornament by listing "${option.keepClass}" in its cssclasses property.`;
  return (
    `/* Aether Works: ${option.title}.\n` +
    `   ${option.description}\n` +
    `   Turn it on or off under Settings → Appearance → CSS snippets. No plugin needed.${keep}\n` +
    "   Generated from scripts/options.ts; edit that, not this file. */\n" +
    block("body", appliedValues(option)) +
    "\n"
  );
}

/** The defaults and the option classes in theme.css. A snippet sets body later and wins; a
 *  class on a note sets the variables closer to the text and wins there. */
export function optionRules(): string {
  const defaults = block("body", THEME_OPTIONS.flatMap(normalValues));
  const classes = THEME_OPTIONS.flatMap((option) => [
    block(`.${option.applyClass}`, appliedValues(option)),
    ...(option.keepClass === null ? [] : [block(`.${option.keepClass}`, normalValues(option))]),
  ]);
  return [defaults, ...classes].join("\n\n");
}

/** The Style Settings block. The theme never needs it. */
export function styleSettingsBlock(): string {
  const entries = THEME_OPTIONS.map((option) =>
    [
      "  -",
      `    id: ${option.applyClass}`,
      `    title: ${option.title}`,
      `    description: ${option.description}`,
      "    type: class-toggle",
      "    default: false",
    ].join("\n"),
  );
  return `/* @settings\n\nname: Aether Works\nid: aether-works\nsettings:\n${entries.join("\n")}\n*/`;
}
