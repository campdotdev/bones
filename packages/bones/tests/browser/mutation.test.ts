/// <reference types="vite-plus/client" />
import { afterEach, expect, test } from "vite-plus/test";
import "../../src/css/bones.css";
import "../../src/element/index.ts";
import type { BonesBoundary } from "../../src/element/index.ts";

// ---------------------------------------------------------------------------
// Mutation-driven re-measurement. The host height is pinned in every fixture,
// so a child swap never resizes the host. ResizeObserver also guarantees one
// callback the first time it observes a target, even with no actual size
// change (there is no previously reported size to compare against yet) — so
// every fixture below settles past that guaranteed first delivery before
// mutating. After the settle, only the MutationObserver can drive a
// re-measure: these tests fail without it (verified — see the fix report).
// ---------------------------------------------------------------------------

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(inner: string): BonesBoundary {
  document.body.insertAdjacentHTML(
    "beforeend",
    `<bones-boundary force precision="measured" transition="none" min-duration="0"
       style="width: 20ch; height: 120px; font: 16px/1.5 monospace;">${inner}</bones-boundary>`,
  );
  return document.querySelector("bones-boundary")!;
}

function bars(el: BonesBoundary): HTMLElement[] {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('[part~="bone"]'));
}

function fragment(html: string): DocumentFragment {
  return document.createRange().createContextualFragment(html);
}

// Lets ResizeObserver's guaranteed first delivery (and any other pending
// microtask/frame work) land and settle before a test's real assertion.
function settle(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

const TWO_LINES = '<p style="margin: 0">aaaa bbbb cccc dddd eeee ffff</p>';
const ONE_LINE = '<p style="margin: 0">short</p>';

test("swapping children re-measures without a resize", async () => {
  const el = mount(TWO_LINES);
  expect(bars(el)).toHaveLength(2);
  await settle();
  el.replaceChildren(fragment(ONE_LINE));
  await expect.poll(() => bars(el).length).toBe(1);
  expect(el.hasAttribute("data-bones-measured")).toBe(true);
});

test("editing text re-measures", async () => {
  const el = mount(TWO_LINES);
  expect(bars(el)).toHaveLength(2);
  await settle();
  (el.querySelector("p")!.firstChild as Text).data = "short";
  await expect.poll(() => bars(el).length).toBe(1);
});

test("an emptied subtree deactivates to the CSS path", async () => {
  const el = mount(TWO_LINES);
  await settle();
  el.replaceChildren();
  await expect.poll(() => el.hasAttribute("data-bones-measured")).toBe(false);
  expect(bars(el)).toHaveLength(0);
});

test("bar rendering does not observe itself", async () => {
  // Bars render into the shadow root; an observer on the host's light tree
  // never reports them. If it did, this would loop: each re-measure replaces
  // the bar elements, which would re-trigger the observer forever.
  const el = mount(TWO_LINES);
  await settle();
  el.replaceChildren(fragment(ONE_LINE));
  await expect.poll(() => bars(el).length).toBe(1);
  const bar = bars(el)[0];
  await settle();
  expect(bars(el)[0]).toBe(bar);
});

test("a class change does not re-measure", async () => {
  // Attribute mutations are deliberately excluded from the observer config:
  // a class or style tick anywhere in the boundary must not touch the bars.
  const el = mount(TWO_LINES);
  await settle();
  const bar = bars(el)[0];
  el.querySelector("p")!.className = "x";
  await settle();
  expect(bars(el)).toHaveLength(2);
  expect(bars(el)[0]).toBe(bar);
});
