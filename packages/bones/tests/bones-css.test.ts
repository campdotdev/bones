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

/** Every reduced-motion block in `source`, flattened. */
function reducedMotionBlocks(source: string): string[] {
  const blocks: string[] = [];
  let rest = source;
  while (rest.includes(REDUCED)) {
    const block = blockAt(rest, REDUCED);
    blocks.push(block);
    rest = rest.slice(rest.indexOf(REDUCED) + REDUCED.length);
  }
  return blocks;
}

/** The `@scope` block for one data-bone-animate value. */
function scopeFor(value: string): string {
  return blockAt(css, `@scope ([data-bone-animate="${value}"])`);
}

describe("bones.css reduced-motion contract", () => {
  test("the default shimmer downgrades to pulse for every bone kind", () => {
    const outside = css.split("@scope")[0];
    const block = blockAt(outside, REDUCED);
    for (const selector of [
      '[data-bone="text"]::after',
      '[data-bone="text"]::before',
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

  test("no reduced-motion block pulses the aria-busy element itself", () => {
    // The old override animated whatever carried aria-busy, which stacked an
    // opacity pulse on top of the bar's own animation instead of replacing it.
    const blocks = reducedMotionBlocks(css);
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      expect(block).not.toMatch(/\[aria-busy="true"\]\s*\{/);
    }
  });
});
