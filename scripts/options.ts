// The theme's options, defined once. Nothing here depends on a plugin: scripts/build.ts
// turns each option into
//   - a CSS snippet in snippets/ that applies it vault-wide (Settings → Appearance →
//     CSS snippets, built into Obsidian),
//   - a class a note can list in its cssclasses property to apply it to that note,
//   - a Style Settings switch, for people who happen to have that plugin.
// All three set the same variables, which the theme reads in src/.

export interface Declaration {
  readonly property: string;
  readonly value: string;
}

export interface ThemeOption {
  /** The snippet name and Style Settings label. */
  readonly title: string;
  readonly description: string;
  /** Class that applies the option: Style Settings puts it on body, a note lists it in cssclasses. */
  readonly applyClass: string;
  /** The variables the option sets. */
  readonly declarations: readonly Declaration[];
  /** For an ornament drawn inside the note: the class a note lists to keep the ornament while
   *  the option is applied vault-wide. It sets the switch back to "on". Null otherwise. */
  readonly keepClass: string | null;
}

/** An option that switches one ornament off. The theme honours it with a style query. */
function switchOff(title: string, description: string, variable: string, applyClass: string, keepClass: string | null): ThemeOption {
  return { title, description, applyClass, declarations: [{ property: variable, value: "off" }], keepClass };
}

export const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    title: "Use Obsidian's fonts",
    description: "Replace the embedded Victorian typefaces with the fonts chosen under Settings, Appearance.",
    applyClass: "aw-plain-fonts",
    declarations: [
      { property: "--aw-font-display", value: "var(--font-interface)" },
      { property: "--aw-font-heading", value: "var(--font-text)" },
      { property: "--aw-font-plaque", value: "var(--font-interface)" },
      { property: "--font-interface-theme", value: "var(--font-default)" },
      { property: "--font-text-theme", value: "var(--font-default)" },
      { property: "--font-monospace-theme", value: "var(--font-monospace-default)" },
      { property: "--font-text-size", value: "16px" },
    ],
    keepClass: null,
  },
  {
    title: "Plain leather",
    description: "Flat colours instead of the leather grain and damask patterns.",
    applyClass: "aw-no-textures",
    declarations: [
      { property: "--aw-leather-grain", value: "none" },
      { property: "--aw-damask", value: "none" },
    ],
    keepClass: null,
  },
  switchOff("No stitching", "Remove the running stitch around the sidebars and drawers.", "--aw-stitching", "aw-no-stitching", null),
  switchOff("No Roman numerals", "Stop numbering second-level headings and outline entries.", "--aw-numerals", "aw-no-numerals", "aw-numerals"),
  switchOff("Plain bullets", "Use ordinary bullets instead of fleurons.", "--aw-fleurons", "aw-plain-bullets", "aw-fleurons"),
  switchOff("Plain title", "A left-aligned note title, without the kicker and flourish.", "--aw-title-ornament", "aw-plain-title", "aw-title-ornament"),
];

/** The prefix every generated snippet shares; deploy uses it to find the theme's own files. */
export const SNIPPET_PREFIX = "Aether Works - ";

/** The file name Obsidian shows in its CSS snippets list. */
export function snippetFileName(option: ThemeOption): string {
  return `${SNIPPET_PREFIX}${option.title}.css`;
}

function block(selector: string, declarations: readonly Declaration[]): string {
  return `${selector} {\n${declarations.map((declaration) => `  ${declaration.property}: ${declaration.value};`).join("\n")}\n}`;
}

/** The keep class undoes a switch: the same variables, set back to "on". */
function keepDeclarations(option: ThemeOption): readonly Declaration[] {
  return option.declarations.map((declaration) => ({ property: declaration.property, value: "on" }));
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
    block("body", option.declarations) +
    "\n"
  );
}

/** The class rules in theme.css, shared by cssclasses and Style Settings. */
export function optionClassRules(): string {
  return THEME_OPTIONS.flatMap((option) => [
    block(`.${option.applyClass}`, option.declarations),
    ...(option.keepClass === null ? [] : [block(`.${option.keepClass}`, keepDeclarations(option))]),
  ]).join("\n\n");
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
