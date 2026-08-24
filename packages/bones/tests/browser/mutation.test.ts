/// <reference types="vite-plus/client" />
import { afterEach, expect, test } from "vite-plus/test";
import "../../src/css/auto.css";
import "../../src/element/index.ts";
import type { BonesBoundary } from "../../src/element/index.ts";

// ---------------------------------------------------------------------------
// Mutation-driven re-measurement. The host height is pinned in every fixture,
// so a child swap never resizes the host and the ResizeObserver cannot be the
// thing that re-measures — these tests fail without the MutationObserver.
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

const TWO_LINES = '<p style="margin: 0">aaaa bbbb cccc dddd eeee ffff</p>';
const ONE_LINE = '<p style="margin: 0">short</p>';

test("swapping children re-measures without a resize", async () => {
  const el = mount(TWO_LINES);
  expect(bars(el)).toHaveLength(2);
  el.replaceChildren(fragment(ONE_LINE));
  await expect.poll(() => bars(el).length).toBe(1);
  expect(el.hasAttribute("data-bones-measured")).toBe(true);
});

test("editing text re-measures", async () => {
  const el = mount(TWO_LINES);
  expect(bars(el)).toHaveLength(2);
  (el.querySelector("p")!.firstChild as Text).data = "short";
  await expect.poll(() => bars(el).length).toBe(1);
});

test("an emptied subtree deactivates to the CSS path", async () => {
  const el = mount(TWO_LINES);
  el.replaceChildren();
  await expect.poll(() => el.hasAttribute("data-bones-measured")).toBe(false);
  expect(bars(el)).toHaveLength(0);
});

test("bar rendering does not observe itself", async () => {
  // Bars render into the shadow root; an observer on the host's light tree
  // never reports them. If it did, this would loop: each re-measure replaces
  // the bar elements, which would re-trigger the observer forever.
  const el = mount(TWO_LINES);
  el.replaceChildren(fragment(ONE_LINE));
  await expect.poll(() => bars(el).length).toBe(1);
  // ResizeObserver guarantees one callback the first time a target is
  // observed, even with no actual size change (there is no previously
  // reported size to compare against) — see #observe in overlay.ts. That
  // fires once here too, harmlessly re-rendering the same content. It is
  // bounded, not a loop: settle past it (confirmed by measurement to land
  // within a couple of frames) before taking the identity baseline, so this
  // assertion isolates the thing it's actually testing — no *further*
  // self-triggered churn — from that unrelated, one-time delivery.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const bar = bars(el)[0];
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  expect(bars(el)[0]).toBe(bar);
});
