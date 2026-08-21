import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vite-plus/test";

// ---------------------------------------------------------------------------
// auto.css selector contract
//
// auto.css skeletonizes unmarked leaves under [aria-busy="true"]. These tests
// read the shipped file, pin its selectors verbatim, and assert which fixture
// elements match. jsdom evaluates :has(), :is(), and complex :not() args, so
// the contract is testable without a browser.
// ---------------------------------------------------------------------------

const css = readFileSync(join(import.meta.dirname, "../src/css/auto.css"), "utf8");
const flat = css.replace(/\s+/g, " ");

const EXEMPT =
  ':not([data-bone], [data-bone] *, [data-bones-auto="off"], [data-bones-auto="off"] *)';
const OVERRIDES = "img, svg, video, canvas, picture, button, input, select, textarea";
const TEXT_LEAF = `[aria-busy="true"] :not(:has(*))${EXEMPT}:not(${OVERRIDES}, svg *, picture *, select *)`;

/** Normalize selector whitespace, handling parentheses. */
function normalize(selector: string): string {
  return selector.replace(/\s+/g, " ").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")").trim();
}

/** Selector text of every rule in `source`, whitespace-normalized. */
function ruleSelectors(source: string): string[] {
  const noComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const selectors: string[] = [];
  for (const match of noComments.matchAll(/(?:^|[{};])\s*([^{}@;]+?)\s*\{/g)) {
    selectors.push(normalize(match[1]));
  }
  return selectors;
}

function mount(html: string): void {
  document.body.innerHTML = html;
}

function el(id: string): Element {
  const found = document.getElementById(id);
  if (!found) throw new Error(`fixture is missing #${id}`);
  return found;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("file contract", () => {
  test("begins with the bones.css import", () => {
    expect(css.trimStart().startsWith('@import "./bones.css";')).toBe(true);
  });

  test("wraps auto rules in the bones-auto layer", () => {
    expect(flat).toContain("@layer bones-auto {");
  });

  test("pins the text-leaf selector", () => {
    expect(ruleSelectors(css)).toContain(TEXT_LEAF);
  });
});

describe("text-leaf trigger", () => {
  test("a leaf under aria-busy matches; branches and outsiders do not", () => {
    mount(`
      <section aria-busy="true">
        <h2 id="leaf">Title</h2>
        <div id="branch"><span id="nested">x</span></div>
      </section>
      <p id="outside">done</p>
    `);
    expect(el("leaf").matches(TEXT_LEAF)).toBe(true);
    expect(el("nested").matches(TEXT_LEAF)).toBe(true);
    expect(el("branch").matches(TEXT_LEAF)).toBe(false);
    expect(el("outside").matches(TEXT_LEAF)).toBe(false);
  });

  test("an empty leaf still matches", () => {
    mount('<section aria-busy="true"><p id="empty"></p></section>');
    expect(el("empty").matches(TEXT_LEAF)).toBe(true);
  });
});

describe("exemptions", () => {
  test("a data-bones-auto=off subtree is exempt", () => {
    mount(`
      <section aria-busy="true">
        <div role="status" data-bones-auto="off" id="status">Saving…</div>
        <div data-bones-auto="off"><span id="statusChild">x</span></div>
      </section>
    `);
    expect(el("status").matches(TEXT_LEAF)).toBe(false);
    expect(el("statusChild").matches(TEXT_LEAF)).toBe(false);
  });

  test("explicit data-bone markup and its descendants are exempt", () => {
    mount(`
      <section aria-busy="true">
        <h3 data-bone="text" id="explicit"></h3>
        <div data-bone="container"><span id="containerChild">x</span></div>
      </section>
    `);
    expect(el("explicit").matches(TEXT_LEAF)).toBe(false);
    expect(el("containerChild").matches(TEXT_LEAF)).toBe(false);
  });
});
