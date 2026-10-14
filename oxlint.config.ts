import { defineConfig } from "oxlint";

// The vendored anti-slop rules (tools/oxlint/anti-slop/) reject the low-evidence
// patterns AI agents tend to write. They are copied in, not installed: read and edit
// them to suit. The Effect-specific group is left out because this project has no Effect.
export default defineConfig({
  ignorePatterns: [
    ".agent/**",
    ".agents/**",
    ".claude/**",
    ".codex/**",
    ".continue/**",
    ".cursor/**",
    ".gemini/**",
    ".opencode/**",
    ".pi/**",
    ".roo/**",
    ".windsurf/**",
    "tools/oxlint/anti-slop/**",
    "node_modules/**",
  ],
  jsPlugins: [{ name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" }],
  rules: {
    "anti-slop/no-chained-type-assertions": "error",
    "anti-slop/no-conditional-empty-object-spread": "error",
    "anti-slop/no-known-value-widening": "error",
    "anti-slop/no-module-mocking": "error",
    "anti-slop/no-object-parameters": "error",
    "anti-slop/no-reflect-apply": "error",
    "anti-slop/no-reflect-get": "error",
    "anti-slop/no-runtime-typeof": "error",
    "anti-slop/no-shape-in-symbol-names": "error",
    "anti-slop/no-unknown-parameters": "error",
    "anti-slop/no-unknown-returns": "error",
    "anti-slop/no-unknown-type-aliases": "error",
    "anti-slop/no-unsafe-dictionary-type": "error",
    "anti-slop/no-widen-then-assert": "error",
    "anti-slop/require-safety-comment-for-type-assertion": "error",
  },
  overrides: [
    {
      // The single JSON decoding boundary. Reading manifest.json and package.json means
      // inspecting a representation somewhere, and the rule's own remedy, "parse input at
      // its I/O boundary", needs one place where that is allowed. Type guards may use
      // typeof here and nowhere else.
      files: ["scripts/json.ts"],
      rules: {
        "anti-slop/no-runtime-typeof": ["error", { allowInTypeGuards: true }],
      },
    },
  ],
});
