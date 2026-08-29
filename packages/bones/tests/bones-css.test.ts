import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";

// ---------------------------------------------------------------------------
// bones.css reduced-motion contract
//
// Marked bones shimmer by default (BON-16), and the shimmer/pulse scopes can
// switch that. Under prefers-reduced-motion: reduce every animated path must
// downgrade to a slow pulse, and data-bone-animate="none" must stay still.
// The browser runner cannot emulate media features, so this reads the shipped
// file and pins where the override lives, the same way boundary.test.ts pins
// the overlay's shadow sheet.
// ---------------------------------------------------------------------------

const css = readFileSync(join(import.meta.dirname, "../src/css/bones.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

/** The marked half: everything before the auto rules' first layer block. */
const marked = css.split("@layer bones-auto")[0];

const REDUCED = "@media (prefers-reduced-motion: reduce)";

/** The brace-balanced block that starts at the first `marker` in `source`. */
function blockAt(source: string, marker: string): string {
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`${marker} not found`);
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) {
      return source
        .slice(start, i + 1)
        .replace(/\s+/g, " ")
        .trim();
    }
  }
  throw new Error(`unbalanced braces after ${marker}`);
}

/** The `@scope` block for one data-bone-animate value. */
function scopeFor(value: string): string {
  return blockAt(css, `@scope ([data-bone-animate="${value}"])`);
}

// `css.split("@scope")[0]` and `scopeFor()` find the first match in the file.
// The marked half comes first, so these pin the marked rules; the auto
// half's scopes sit after it and are pinned by auto-css.test.ts.
describe("bones.css reduced-motion contract", () => {
  test("the default shimmer downgrades to pulse for every bone kind", () => {
    const outside = css.split("@scope")[0];
    const block = blockAt(outside, REDUCED);
    for (const selector of [
      '[data-bone="text"]::after',
      '[data-bone="block"]',
      '[data-bone="container"]::before',
    ]) {
      expect(block).toContain(selector);
    }
    expect(block).toContain("animation: bone-pulse");
  });

  test("the shimmer and pulse scopes downgrade to pulse inside the scope", () => {
    for (const value of ["shimmer", "pulse"]) {
      const scope = scopeFor(value);
      const block = blockAt(scope, REDUCED);
      expect(block).toContain(":is(:scope, :scope *)");
      expect(block).toContain("animation: bone-pulse");
    }
  });

  test("the none scope has no reduced-motion override: none still means none", () => {
    expect(scopeFor("none")).not.toContain(REDUCED);
  });

  test("nothing animates the aria-busy element itself", () => {
    // The old reduced-motion override animated whatever carried aria-busy,
    // which stacked an opacity pulse on top of the bar's own animation
    // instead of replacing it. Marked bones target their bars, never the
    // carrier. The auto half matches [aria-busy="true"] by design, so this
    // guard reads the marked half only.
    expect(marked).not.toContain('[aria-busy="true"]');
  });
});
