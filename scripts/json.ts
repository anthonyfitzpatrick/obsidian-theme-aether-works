/**
 * The project's only JSON decoding boundary.
 *
 * `JSON.parse` returns `any`. Narrowing that with scattered `typeof` checks would spread
 * an unverified contract through the scripts and tests, so representation is inspected
 * here and nowhere else (the lint override in oxlint.config.ts allows `typeof` only in
 * this file's type guards). Callers read named fields through `readText` and get
 * `null`, never an unchecked value.
 */
export type JsonValue = string | number | boolean | null | readonly JsonValue[] | JsonObject;

export interface JsonObject {
  readonly [key: string]: JsonValue | undefined;
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonString(value: JsonValue | undefined): value is string {
  return typeof value === "string";
}

/** Parses JSON text that must hold an object. Throws, naming the source, if it doesn't. */
export function parseJsonObject(text: string, source: string): JsonObject {
  /**
   * SAFETY: `JSON.parse` is typed `any` by the standard library; this is the boundary
   * that closes it. The value is checked by `isJsonObject` on the next line and every
   * field is read through a guard, so no unverified shape escapes this module.
   */
  const parsed = JSON.parse(text) as JsonValue;
  if (!isJsonObject(parsed)) throw new Error(`${source} does not contain a JSON object`);
  return parsed;
}

/** A trimmed, non-empty string field, or null. */
export function readText(source: JsonObject, key: string): string | null {
  const value = source[key];
  if (!isJsonString(value)) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
