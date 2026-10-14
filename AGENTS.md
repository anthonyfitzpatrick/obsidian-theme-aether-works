# Aether Works — repository guide

An Obsidian community theme: a Victorian steampunk look in light and dark modes, on desktop and mobile. Plain CSS, no runtime JavaScript. The scripts and tests are strict TypeScript, run directly by Node 22.18+ with no compile step. The only dependencies are dev tools.

## Commands

- `npm run build` regenerates `theme.css`. It writes the embedded `@font-face` rules from `fonts/` (listed in `scripts/fonts.ts`), then the option classes and Style Settings block (from `scripts/options.ts`), then `src/*.css` in filename order. It also writes `snippets/`.
- `npm run lint` runs oxlint, with the vendored **anti-slop** rules, on the TypeScript, and stylelint on `src/`.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm test` runs `node --test "tests/*.test.ts"`.
- `npm run check` runs lint, typecheck, the stale-`theme.css` check and the tests. CI, the pre-commit hook (`git config core.hooksPath .githooks`) and the release workflow all run it. A `PostToolUse` hook in `.claude/settings.json` runs `npm run lint` after every edit Claude makes.
- `AETHER_WORKS_VAULT=<vault> npm run deploy` builds the theme and copies it to `<vault>/.obsidian/themes/Aether Works/`.
- `scripts/screenshots.sh <dark|light> <folder> [width] [height]` captures the demo vault. See `docs/SCREENSHOTS.md`.

## Obsidian's theme guidelines (enforced by `.stylelintrc.json` and the tests)

- **Variables first.** Shared tokens go under `body` (`src/01`). Colours go under `.theme-light` / `.theme-dark` in the palettes (`src/02`, `src/03`). Obsidian's own variables are mapped once, in `src/04`. Where Obsidian paints a state from a variable (menu highlights, sidebar text, icon colours), set that variable on the element rather than outranking Obsidian's rule.
- **Low specificity.** stylelint caps selectors at `0,3,0`. Wrap context in `:where()`. Options are variables the theme reads, not body classes (see below).
- **No `!important`, no remote assets, no `@import`, no `@font-face` in `src/`.** Fonts are embedded only by the build.
- **No obfuscation, ads or telemetry.**
- **Releases.** A GitHub release whose tag equals `manifest.json`'s version, with `manifest.json` and `theme.css` attached. `.github/workflows/release.yml` makes it, but only when a tag is pushed. Never push tags unless a release is explicitly requested.

## Options: never rely on a plugin

- Every option must work with Obsidian alone. Options are defined once, in `scripts/options.ts`. The build generates three things from them:
  - a CSS snippet per option in `snippets/` (vault-wide, through *Appearance → CSS snippets*)
  - the classes a note can list in `cssclasses`
  - an optional Style Settings block
- Each option is a list of switches: a variable the theme reads with `var()`, its normal value and its applied value. The build writes the defaults into theme.css; never set a switch variable in `src/`. No style queries: Obsidian's directory flags them as only partly supported. Never style a Style Settings class directly. `tests/options.test.ts` enforces all of this.
- Deploy copies the snippets into the vault's `.obsidian/snippets/`, where they arrive switched off.

## Anti-slop rules

- `tools/oxlint/anti-slop/` is vendored (MIT, © Dillon Mulroy). Edit the rules to suit.
- Never silence a rule with a disable comment. Fix the code: use named domain types, and give any type assertion a `SAFETY:` comment.
- JSON is parsed only in `scripts/json.ts`, the one file allowed `typeof` in type guards.
- CSS: no duplicate selectors or properties, no hex colours outside the palettes and print styles, and every `--aw-*` token is both defined and used (`tests/tokens.test.ts`).

## Other rules

- Never edit `theme.css` by hand. Edit `src/` and rebuild.
- Palettes hold colours only, and both define the same tokens (tested). Structure goes in the component modules (`01` tokens and option defaults, `10` workspace, `20` content, `30` controls, `40` overlays, `50` responsive and mobile, `90` accessibility and print).
- Every new text/background pairing goes in `tests/contrast.test.ts` and must pass in both modes.
- New fonts: add the `.woff2` to `fonts/`, register it in `scripts/fonts.ts`, credit it in `fonts/README.md`, and include its licence text. `tests/fonts.test.ts` checks all four.
- The README and User Guide show every picture in `docs/images/`, each with alt text of at least 80 characters and an italic caption of at least 200 characters straight after it (`tests/docs.test.ts`). Describe only what the picture actually shows, and update the captions whenever a screenshot is retaken.
- Screenshots come only from the demo vault (`docs/Aether Works Demo`), never from a real vault. Never run `obsidian dev:mobile`, because it reloads windows. For mobile, run `app.emulateMobile(true)` with `eval` against the demo vault only.
- `manifest.json` and `package.json` versions must match. The theme name is "Aether Works" (the community directory identifier); don't change it.
- Remote `origin` pushes to both GitHub and the owner's Gitea. `github` is the fetch-only reference.

## Project notes

Planning, design, decisions and backlog live in the Wolf 359 Press AB vault under `Software Development/Obsidian Plugins and Themes/Steampunk victorian theme/` (start at `Aether Works.md`). Update them when a decision or the backlog changes. The original design mockup (`Steampunk Obsidian Theme.html`) and prototype `theme.css` are kept there as the design reference.
