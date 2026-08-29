import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vite-plus/test";

// ---------------------------------------------------------------------------
// bones.css contract
//
// One activation condition, two cascade strengths. Inferred rules live in
// @layer bones-auto and must lose to page CSS; explicit data-bones-type and
// data-bones-lines rules are unlayered and must win. These tests read the
// shipped file, pin the selectors and the layer split, pin the two copies of
// the bar geometry equal, and assert which fixture elements match. jsdom
// evaluates :has(), :is(), and complex :not() args, so the selector contract
// is testable without a browser.
// ---------------------------------------------------------------------------

const raw = readFileSync(join(import.meta.dirname, "../src/css/bones.css"), "utf8");

/**
 * Comments stripped, whitespace collapsed, brace and paren spacing
 * normalized. Quoted string literals (the data: URI, content values) are
 * protected from the whitespace-collapsing passes so a bare `;` inside
 * `url("data:image/gif;base64,...")` is not turned into `; `.
 */
function normalize(source: string): string {
  const strings: string[] = [];
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const protectedStrings = withoutComments.replace(/"[^"]*"/g, (match) => {
    strings.push(match);
    return `\uE000${strings.length - 1}\uE000`;
  });
  return protectedStrings
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s*\{\s*/g, " { ")
    .replace(/\s*\}\s*/g, " } ")
    .replace(/\s*;\s*/g, "; ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\uE000(\d+)\uE000/g, (_, index) => strings[Number(index)]);
}

const css = normalize(raw);

const BUSY = ':is([aria-busy="true"], [aria-busy="true"] *)';
const EXEMPT =
  ':not([data-bones-type], [data-bones-type] *, [data-bones-lines], [data-bones-lines] *, [data-bones-auto="off"], [data-bones-auto="off"] *)';
const BLOCKS =
  "img, svg, video, canvas, picture, iframe, embed, object, audio, button, input, select, textarea, progress, meter";
const SKIP = `${BLOCKS}, hr, br, svg *, picture *, select *, object *`;
const TEXT_TAIL = `:not(:has(*))${EXEMPT}:not(${SKIP})`;
const BLOCK_TAIL = `:is(${BLOCKS})${EXEMPT}`;
const EXPLICIT_TEXT_TAIL = ':is([data-bones-type="text"], [data-bones-lines])';
const EXPLICIT_BLOCK_TAIL = '[data-bones-type="block"]';

/** Every brace-balanced block that starts at `marker`, marker included. */
function blocksAt(source: string, marker: string): string[] {
  const found: string[] = [];
  let from = 0;
  for (;;) {
    const start = source.indexOf(marker, from);
    if (start === -1) return found;
    const open = source.indexOf("{", start);
    let depth = 0;
    for (let i = open; i < source.length; i++) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}" && --depth === 0) {
        found.push(source.slice(start, i + 1));
        from = i + 1;
        break;
      }
    }
    if (depth !== 0) throw new Error(`unbalanced braces after ${marker}`);
  }
}

function blockAt(source: string, marker: string): string {
  const [first] = blocksAt(source, marker);
  if (!first) throw new Error(`${marker} not found`);
  return first;
}

/** The declarations of the outermost block only (nested blocks removed). */
function ownDeclarations(block: string): string {
  const body = block.slice(block.indexOf("{") + 1, block.lastIndexOf("}"));
  let depth = 0;
  let out = "";
  for (const ch of body) {
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (depth === 0) out += ch;
  }
  return out.replace(/\s+/g, " ").trim();
}

const layerBlocks = blocksAt(css, "@layer bones-auto {");
const layered = layerBlocks.join(" ");
const unlayered = layerBlocks.reduce((rest, block) => rest.replace(block, ""), css);

function mount(html: string): void {
  document.body.innerHTML = html;
}

function el(id: string): Element {
  const found = document.getElementById(id);
  if (!found) throw new Error(`fixture is missing #${id}`);
  return found;
}

/** The busy scope, evaluated the way the stylesheet's :is() prefix does. */
function inBusy(node: Element): boolean {
  return node.matches('[aria-busy="true"], [aria-busy="true"] *');
}

const isTextLeaf = (node: Element) => inBusy(node) && node.matches(TEXT_TAIL);
const isBlockLeaf = (node: Element) => inBusy(node) && node.matches(BLOCK_TAIL);
const isExplicitText = (node: Element) => inBusy(node) && node.matches(EXPLICIT_TEXT_TAIL);
const isExplicitBlock = (node: Element) => inBusy(node) && node.matches(EXPLICIT_BLOCK_TAIL);

afterEach(() => {
  document.body.innerHTML = "";
});

describe("file shape", () => {
  test("declares the layer first and has no @import", () => {
    expect(css.startsWith("@layer bones-auto;")).toBe(true);
    expect(css).not.toContain("@import");
  });

  test("ships no old attribute or property names", () => {
    for (const old of [
      "data-bone=",
      "data-bone-line",
      "data-bone-animate",
      "--bone-length",
      "--bone-contained",
    ]) {
      expect(css).not.toContain(old);
    }
  });

  test("inferred rules are layered and explicit rules are not", () => {
    expect(layerBlocks.length).toBeGreaterThan(0);
    expect(layered).toContain(`${BUSY} { &${TEXT_TAIL} {`);
    expect(layered).toContain(`&${BLOCK_TAIL} {`);
    expect(unlayered).not.toContain(":not(:has(*))");
    expect(unlayered).not.toContain("data-bones-auto");
    expect(unlayered).toContain(`${BUSY} { &${EXPLICIT_TEXT_TAIL} {`);
    expect(unlayered).toContain(`&${EXPLICIT_BLOCK_TAIL} {`);
    expect(layered).not.toContain('data-bones-type="');
    expect(layered).not.toContain("[data-bones-lines]::");
  });

  test("the busy scope admits the busy element itself", () => {
    mount('<p id="host" aria-busy="true"></p>');
    expect(isTextLeaf(el("host"))).toBe(true);
  });

  test("keeps opted-out subtrees visible under a measured overlay", () => {
    expect(layered).toContain(
      'bones-boundary[data-bones-measured] [data-bones-auto="off"] { visibility: visible; }',
    );
  });
});

describe("bar geometry is the same in both strengths", () => {
  test("text ::after", () => {
    const inferred = ownDeclarations(blockAt(blockAt(layered, `&${TEXT_TAIL} {`), "&::after {"));
    const explicit = ownDeclarations(
      blockAt(blockAt(unlayered, `&${EXPLICIT_TEXT_TAIL} {`), "&::after {"),
    );
    expect(inferred).toBe(explicit);
    expect(inferred).toContain("top: var(--bones-bar-top)");
    expect(inferred).toContain("height: 1ex");
    expect(inferred).toContain("border-radius: var(--bone-radius)");
    expect(inferred).toContain("animation: bone-shimmer var(--bone-duration) ease-in-out infinite");
  });

  test("empty inline leaves get width from ::before", () => {
    const rule = '&:empty::before { content: ""; display: inline-block; min-width: 4ch; }';
    expect(blockAt(layered, `&${TEXT_TAIL} {`)).toContain(rule);
    // Unlike the inferred rule, the explicit `:empty::before` sits beside
    // `&${EXPLICIT_TEXT_TAIL}`, not nested inside it, so a lines element
    // (display: block, no inline width trick needed) is unaffected. Check
    // it directly against the unlayered text, not inside that rule's block.
    expect(unlayered).toContain(
      '&[data-bones-type="text"]:empty::before { content: ""; display: inline-block; min-width: 4ch; }',
    );
  });

  test("block", () => {
    const inferred = ownDeclarations(blockAt(layered, `&${BLOCK_TAIL} {`));
    const explicit = ownDeclarations(blockAt(unlayered, `&${EXPLICIT_BLOCK_TAIL} {`));
    expect(inferred).toBe(explicit);
    expect(inferred).toContain("object-position: 9999px 0");
    expect(inferred).toContain("transition: none");
  });

  test("explicit block hides its descendants", () => {
    expect(unlayered).toContain('&[data-bones-type="block"] > * { visibility: hidden; }');
  });
});

describe("data-bones-lines", () => {
  test("enumerates 2 through 8 and reads any value with advanced attr()", () => {
    for (let n = 2; n <= 8; n++) {
      expect(unlayered).toContain(`[data-bones-lines="${n}"] { --bones-lines: ${n}; }`);
    }
    const supports = blockAt(unlayered, "@supports (x: attr(x type(*))) {");
    expect(supports).toContain(
      "[data-bones-lines] { --bones-lines: attr(data-bones-lines type(<number>), 1); }",
    );
  });

  test("sizes the box from the line count and paints the rows above the last", () => {
    const text = blockAt(unlayered, `&${EXPLICIT_TEXT_TAIL} {`);
    expect(ownDeclarations(text)).toContain("min-height: calc(var(--bones-lines, 1) * 1lh)");
    const lines = blockAt(unlayered, "&[data-bones-lines] {");
    const own = ownDeclarations(lines);
    expect(own).toContain("display: block");
    expect(own).toContain("--bones-last: 60%");
    expect(own).toContain("--bones-r: max(0.01px, min(var(--bone-radius), 0.5ex))");
    const rows = blockAt(lines, "&::before {");
    expect(rows).toContain("inset: 0 0 1lh 0");
    expect(rows).toContain("mask-repeat: repeat-y");
    expect(rows).toContain("mask-position: var(--bones-r) 0, left 0, right 0");
    const last = blockAt(lines, "&::after {");
    expect(last).toContain("top: auto");
    expect(last).toContain("bottom: calc(1lh - var(--bones-bar-top) - 1ex)");
    expect(last).toContain("width: var(--bones-last)");
  });

  test("a lines element is explicit, not inferred", () => {
    mount('<section aria-busy="true"><p id="p" data-bones-lines="3"></p></section>');
    expect(isExplicitText(el("p"))).toBe(true);
    expect(isTextLeaf(el("p"))).toBe(false);
  });
});

describe("images with no src", () => {
  test("get a box and a transparent pixel in both strengths", () => {
    const rule = `display: inline-block; content: url("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")`;
    expect(blockAt(layered, `&:is(img):is(:not([src]), [src=""])${EXEMPT} {`)).toContain(rule);
    expect(
      blockAt(unlayered, '&[data-bones-type="block"]:is(img):is(:not([src]), [src=""]) {'),
    ).toContain(rule);
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
    expect(isTextLeaf(el("leaf"))).toBe(true);
    expect(isTextLeaf(el("nested"))).toBe(true);
    expect(isTextLeaf(el("branch"))).toBe(false);
    expect(isTextLeaf(el("outside"))).toBe(false);
  });

  test("an empty leaf still matches", () => {
    mount('<section aria-busy="true"><p id="empty"></p></section>');
    expect(isTextLeaf(el("empty"))).toBe(true);
  });
});

describe("exemptions", () => {
  test("a data-bones-auto=off subtree is exempt from inference", () => {
    mount(`
      <section aria-busy="true">
        <div role="status" data-bones-auto="off" id="status">Saving…</div>
        <div data-bones-auto="off"><span id="statusChild">x</span></div>
      </section>
    `);
    expect(isTextLeaf(el("status"))).toBe(false);
    expect(isTextLeaf(el("statusChild"))).toBe(false);
  });

  test("explicit markup and its descendants are exempt from inference", () => {
    mount(`
      <section aria-busy="true">
        <h3 data-bones-type="text" id="explicit"></h3>
        <div data-bones-type="block"><span id="blockChild">x</span></div>
        <p data-bones-lines="2"><em id="linesChild">x</em></p>
      </section>
    `);
    expect(isTextLeaf(el("explicit"))).toBe(false);
    expect(isExplicitText(el("explicit"))).toBe(true);
    expect(isTextLeaf(el("blockChild"))).toBe(false);
    expect(isTextLeaf(el("linesChild"))).toBe(false);
  });

  test("explicit markup still paints inside a data-bones-auto=off subtree", () => {
    // A wrapper stands in for <body>: innerHTML drops a nested body tag.
    mount(`
      <div data-bones-auto="off">
        <section aria-busy="true">
          <h3 data-bones-type="text" id="marked"></h3>
          <p id="unmarked"></p>
        </section>
      </div>
    `);
    expect(isExplicitText(el("marked"))).toBe(true);
    expect(isTextLeaf(el("unmarked"))).toBe(false);
  });
});

describe("block inference", () => {
  test("replaced elements and form controls are blocks, not text", () => {
    mount(`
      <section aria-busy="true">
        <img id="img" alt="" />
        <button id="button">Save</button>
        <input id="input" />
        <select id="select"><option>a</option></select>
        <textarea id="textarea"></textarea>
        <iframe id="iframe" title="embed"></iframe>
        <embed id="embed" />
        <object id="object"></object>
        <audio id="audio"></audio>
        <progress id="progress"></progress>
        <meter id="meter"></meter>
        <p id="text">copy</p>
      </section>
    `);
    for (const id of [
      "img",
      "button",
      "input",
      "select",
      "textarea",
      "iframe",
      "embed",
      "object",
      "audio",
      "progress",
      "meter",
    ]) {
      expect(isBlockLeaf(el(id))).toBe(true);
      expect(isTextLeaf(el(id))).toBe(false);
    }
    expect(isBlockLeaf(el("text"))).toBe(false);
    expect(isTextLeaf(el("text"))).toBe(true);
  });

  test("object fallback content, hr, br, and svg internals get nothing", () => {
    mount(`
      <section aria-busy="true">
        <object id="objectWithFallback"><span id="fallback">install a plugin</span></object>
        <hr id="hr" /><br id="br" />
        <svg id="svg" viewBox="0 0 10 10"><path id="path" d="M0 0" /></svg>
      </section>
    `);
    expect(isBlockLeaf(el("objectWithFallback"))).toBe(true);
    expect(isBlockLeaf(el("svg"))).toBe(true);
    for (const id of ["fallback", "hr", "br", "path"]) {
      expect(isTextLeaf(el(id))).toBe(false);
      expect(isBlockLeaf(el(id))).toBe(false);
    }
  });

  test("an explicit block is not also an inferred block", () => {
    mount(`
      <section aria-busy="true">
        <div data-bones-auto="off"><img id="offImg" alt="" /></div>
        <img data-bones-type="block" id="explicitImg" alt="" />
        <div data-bones-type="block" id="explicitDiv"><p>x</p></div>
      </section>
    `);
    expect(isBlockLeaf(el("offImg"))).toBe(false);
    expect(isBlockLeaf(el("explicitImg"))).toBe(false);
    expect(isExplicitBlock(el("explicitImg"))).toBe(true);
    expect(isExplicitBlock(el("explicitDiv"))).toBe(true);
  });
});

describe("width variance", () => {
  const buckets = [
    { nth: ":nth-child(4n + 1)", width: "85%" },
    { nth: ":nth-child(4n + 2)", width: "100%" },
    { nth: ":nth-child(4n + 3)", width: "92%" },
    { nth: ":nth-child(4n)", width: "60%" },
  ];

  test("each bucket rule ships with its width inside the inferred text rule", () => {
    const text = blockAt(layered, `&${TEXT_TAIL} {`);
    for (const bucket of buckets) {
      expect(text).toContain(`&${bucket.nth} { width: ${bucket.width}; }`);
    }
  });

  test("positions land in the expected buckets", () => {
    mount(`<section aria-busy="true">${"<p>x</p>".repeat(8)}</section>`);
    const paragraphs = [...document.querySelectorAll("section > p")];
    expect(paragraphs[0].matches(TEXT_TAIL + buckets[0].nth)).toBe(true);
    expect(paragraphs[1].matches(TEXT_TAIL + buckets[1].nth)).toBe(true);
    expect(paragraphs[2].matches(TEXT_TAIL + buckets[2].nth)).toBe(true);
    expect(paragraphs[3].matches(TEXT_TAIL + buckets[3].nth)).toBe(true);
    expect(paragraphs[4].matches(TEXT_TAIL + buckets[0].nth)).toBe(true);
    expect(paragraphs[0].matches(TEXT_TAIL + buckets[1].nth)).toBe(false);
  });
});

describe("motion", () => {
  const REDUCED = "@media (prefers-reduced-motion: reduce) {";
  const INFERRED_GROUP = `&${TEXT_TAIL}::after, &${BLOCK_TAIL} {`;
  const EXPLICIT_GROUP = `&${EXPLICIT_TEXT_TAIL}::after, &[data-bones-lines]::before, &${EXPLICIT_BLOCK_TAIL} {`;

  test("both strengths downgrade the default shimmer to pulse under reduced motion", () => {
    for (const [source, group] of [
      [layered, INFERRED_GROUP],
      [unlayered, EXPLICIT_GROUP],
    ] as const) {
      const outsideScopes = source.split("@scope")[0];
      const block = blockAt(outsideScopes, REDUCED);
      expect(block).toContain(group);
      expect(block).toContain("animation: bone-pulse 2s ease-in-out infinite");
    }
  });

  test("the animate scopes pin their selector groups in both strengths", () => {
    for (const value of ["shimmer", "pulse", "none"]) {
      const marker = `@scope ([data-bones-animate="${value}"]) to ([data-bones-animate]:not([data-bones-animate="${value}"])) {`;
      const [inferred] = blocksAt(layered, marker);
      const [explicit] = blocksAt(unlayered, marker);
      expect(inferred).toContain(`${BUSY}:is(:scope, :scope *) { ${INFERRED_GROUP}`);
      expect(explicit).toContain(`${BUSY}:is(:scope, :scope *) { ${EXPLICIT_GROUP}`);
      if (value === "none") {
        expect(inferred).not.toContain(REDUCED);
        expect(explicit).not.toContain(REDUCED);
        expect(inferred).toContain("animation: none");
      } else {
        expect(blockAt(inferred, REDUCED)).toContain(
          "animation: bone-pulse 2s ease-in-out infinite",
        );
        expect(blockAt(explicit, REDUCED)).toContain(
          "animation: bone-pulse 2s ease-in-out infinite",
        );
      }
    }
  });

  test("forced colors swaps to system colors at the top level of both strengths", () => {
    for (const source of [layered, unlayered]) {
      const block = blockAt(source.split("@scope")[0], "@media (forced-colors: active) {");
      expect(block).toContain("background-color: GrayText");
      expect(block).toContain("forced-color-adjust: none");
    }
  });
});
