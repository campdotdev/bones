/// <reference types="vite-plus/client" />
import { afterEach, expect, test } from "vite-plus/test";
import "../../src/css/auto.css";
import "../../src/element/index.ts";
import type { BonesBoundary } from "../../src/element/index.ts";

// ---------------------------------------------------------------------------
// precision="measured" end to end in Chromium. Fixtures use monospace and
// ch widths so wrapping is deterministic; force skips the delay timer so
// activation is synchronous.
// ---------------------------------------------------------------------------

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(inner: string, attrs = ""): BonesBoundary {
  document.body.insertAdjacentHTML(
    "beforeend",
    `<bones-boundary force precision="measured" transition="none" min-duration="0" ${attrs}
       style="width: 20ch; font: 16px/1.5 monospace;">${inner}</bones-boundary>`,
  );
  return document.querySelector("bones-boundary")!;
}

function bars(el: BonesBoundary): HTMLElement[] {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('[part~="bone"]'));
}

const TWO_LINES = '<p style="margin: 0">aaaa bbbb cccc dddd eeee ffff</p>';

test("shows one bar per line and marks the host", () => {
  const el = mount(TWO_LINES);
  expect(el.hasAttribute("data-bones-measured")).toBe(true);
  expect(el.getAttribute("data-bones-auto")).toBe("off");
  expect(bars(el)).toHaveLength(2);
});

test("bars sit where the lines are", () => {
  const el = mount(TWO_LINES);
  const text = el.querySelector("p")!.firstChild!;
  const range = document.createRange();
  range.selectNodeContents(text);
  const lines = Array.from(range.getClientRects());
  const boxes = bars(el).map((bar) => bar.getBoundingClientRect());
  expect(boxes).toHaveLength(lines.length);
  for (const [i, line] of lines.entries()) {
    expect(boxes[i].left).toBeCloseTo(line.left, 0);
    expect(boxes[i].width).toBeCloseTo(line.width, 0);
    expect(boxes[i].top + boxes[i].height / 2).toBeCloseTo(line.top + line.height / 2, 0);
  }
});

test("content hides while the overlay shows, and returns on hide", () => {
  const el = mount(TWO_LINES);
  const p = el.querySelector("p")!;
  expect(getComputedStyle(p).visibility).toBe("hidden");
  el.force = false;
  // min-duration=0, transition=none: the hide is synchronous.
  expect(el.hasAttribute("data-bones-measured")).toBe(false);
  expect(el.hasAttribute("data-bones-auto")).toBe(false);
  expect(getComputedStyle(p).visibility).toBe("visible");
  expect(bars(el)).toHaveLength(0);
});

test("replaced elements get block bars", () => {
  const el = mount('<img alt="" style="display: block; width: 48px; height: 48px" />');
  const [bar] = bars(el);
  expect(bar.getAttribute("part")).toBe("bone bone-block");
  const box = bar.getBoundingClientRect();
  const img = el.querySelector("img")!.getBoundingClientRect();
  expect(box.width).toBeCloseTo(img.width, 0);
  expect(box.height).toBeCloseTo(img.height, 0);
});

test("an opted-out subtree gets no bars and stays visible", () => {
  const el = mount(`${TWO_LINES}<div data-bones-auto="off"><p style="margin: 0">live</p></div>`);
  expect(bars(el)).toHaveLength(2);
  // Scoped to the div specifically: while measuring, the host itself also
  // carries data-bones-auto="off" (overlay-owned), so the unscoped
  // `[data-bones-auto="off"] p` would match the TWO_LINES paragraph (a
  // direct child of the host) before it reaches this subtree's own p.
  const live = el.querySelector('div[data-bones-auto="off"] p')!;
  // The auto.css rule flips inherited visibility back on for the subtree.
  expect(getComputedStyle(live).visibility).toBe("visible");
});

test("an empty boundary stays on the CSS path", () => {
  const el = mount("");
  expect(el.hasAttribute("data-bones-measured")).toBe(false);
  expect(el.hasAttribute("data-bones-auto")).toBe(false);
  expect(bars(el)).toHaveLength(0);
});

test("resizing the host re-measures", async () => {
  const el = mount(TWO_LINES);
  expect(bars(el)).toHaveLength(2);
  // 40ch fits all 29 characters on one line.
  el.style.width = "40ch";
  await expect.poll(() => bars(el).length).toBe(1);
});

test("precision flips live while showing", () => {
  const el = mount(TWO_LINES);
  el.precision = "css";
  expect(el.hasAttribute("data-bones-measured")).toBe(false);
  expect(bars(el)).toHaveLength(0);
  el.precision = "measured";
  expect(el.hasAttribute("data-bones-measured")).toBe(true);
  expect(bars(el)).toHaveLength(2);
});

// ---------------------------------------------------------------------------
// Coverage added after Task 7's review: the author-owned vs overlay-owned
// data-bones-auto split, and a precision flip that happens while the element
// is disconnected from the document.
// ---------------------------------------------------------------------------

test("an author-set data-bones-auto on the host survives the overlay lifecycle", () => {
  const el = mount(TWO_LINES, 'data-bones-auto="off"');
  expect(el.hasAttribute("data-bones-measured")).toBe(true);
  expect(el.getAttribute("data-bones-auto")).toBe("off");
  // measureBones only skips descendant [data-bones-auto="off"] subtrees; the
  // host itself is never checked, so its own content still gets bars.
  expect(bars(el)).toHaveLength(2);

  el.force = false;
  // min-duration=0, transition=none: the hide is synchronous.
  expect(el.hasAttribute("data-bones-measured")).toBe(false);
  // Author-owned: the overlay never put this attribute on, so it never
  // takes it off.
  expect(el.getAttribute("data-bones-auto")).toBe("off");
});

test("the overlay-owned data-bones-auto is removed on hide", () => {
  const el = mount(TWO_LINES);
  expect(el.getAttribute("data-bones-auto")).toBe("off");
  el.force = false;
  expect(el.hasAttribute("data-bones-auto")).toBe(false);
});

test("a precision flip while disconnected is honored on reconnect", () => {
  const el = mount(TWO_LINES);
  expect(bars(el)).toHaveLength(2);
  el.remove();
  el.precision = "css";
  document.body.append(el);
  expect(el.hasAttribute("data-bones-measured")).toBe(false);
  expect(bars(el)).toHaveLength(0);
  // data-bones-measured is gone, so the ::slotted hide rule no longer
  // matches: content is visible either way, with or without the auto.css
  // opt-out rule.
  const p = el.querySelector("p")!;
  expect(getComputedStyle(p).visibility).toBe("visible");
});
