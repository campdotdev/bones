import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import "../src/index.ts";
import { BOOTSTRAP_JS, BOOTSTRAP_SCRIPT } from "../src/server/bootstrap.ts";

// ---------------------------------------------------------------------------
// The shipped bootstrap string, executed against both of its branches: an
// upgraded <bones-boundary> (busy = false, its own machinery hides) and a
// plain [data-bones-slot] target (attributes removed directly).
// ---------------------------------------------------------------------------

type Swap = (id: string, err?: number) => void;

function swap(): Swap {
  // oxlint-disable-next-line no-eval -- the deliverable is a string of JS; executing it is the test
  window.eval(BOOTSTRAP_JS);
  return (window as unknown as { __bonesSwap: Swap }).__bonesSwap;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

test("BOOTSTRAP_SCRIPT is the runtime in one script tag", () => {
  expect(BOOTSTRAP_SCRIPT).toBe(`<script>${BOOTSTRAP_JS}</script>`);
});

test("non-upgraded target: swaps children, removes the template and all three attributes", () => {
  document.body.innerHTML =
    '<div data-bones-slot="a" busy aria-busy="true" inert><p>fallback</p></div>' +
    '<template data-bones-chunk="a"><p>real</p></template>';
  swap()("a");
  const target = document.querySelector('[data-bones-slot="a"]')!;
  expect(target.innerHTML).toBe("<p>real</p>");
  expect(target.hasAttribute("busy")).toBe(false);
  expect(target.hasAttribute("aria-busy")).toBe(false);
  expect(target.hasAttribute("inert")).toBe(false);
  expect(document.querySelector("template")).toBeNull();
});

test("upgraded boundary: content swaps at once, the element hides on its own clock", () => {
  document.body.innerHTML =
    '<bones-boundary busy aria-busy="true" inert data-bones-slot="a"><p>fallback</p></bones-boundary>' +
    '<template data-bones-chunk="a"><p>real</p></template>';
  const el = document.querySelector("bones-boundary")!;
  // Server-rendered aria-busy adopts as showing at upgrade (BON-3).
  expect(el.showing).toBe(true);
  const log: string[] = [];
  el.addEventListener("bones:hide", () => log.push("hide"));
  swap()("a");
  expect(el.innerHTML).toBe("<p>real</p>");
  expect(el.busy).toBe(false);
  // min-duration (default 400ms) counts from upgrade: still draining, and
  // the bootstrap left aria-busy and inert to the element.
  expect(el.getAttribute("aria-busy")).toBe("true");
  expect(el.hasAttribute("inert")).toBe(true);
  vi.advanceTimersByTime(400);
  expect(el.hasAttribute("aria-busy")).toBe(false);
  expect(log).toEqual(["hide"]);
});

test("error chunk with content: swaps, marks, unbusies", () => {
  document.body.innerHTML =
    '<div data-bones-slot="a" busy aria-busy="true" inert><p>fallback</p></div>' +
    '<template data-bones-chunk="a"><p>broke</p></template>';
  swap()("a", 1);
  const target = document.querySelector('[data-bones-slot="a"]')!;
  expect(target.innerHTML).toBe("<p>broke</p>");
  expect(target.getAttribute("data-bones-error")).toBe("");
  expect(target.hasAttribute("aria-busy")).toBe(false);
});

test("bare error chunk: keeps the fallback children, marks, unbusies", () => {
  document.body.innerHTML =
    '<div data-bones-slot="a" busy aria-busy="true" inert><p>fallback</p></div>';
  swap()("a", 1);
  const target = document.querySelector('[data-bones-slot="a"]')!;
  expect(target.innerHTML).toBe("<p>fallback</p>");
  expect(target.getAttribute("data-bones-error")).toBe("");
  expect(target.hasAttribute("busy")).toBe(false);
  expect(target.hasAttribute("aria-busy")).toBe(false);
  expect(target.hasAttribute("inert")).toBe(false);
});

test("missing boundary: removes the orphan template, throws nothing", () => {
  document.body.innerHTML = '<template data-bones-chunk="a"><p>real</p></template>';
  swap()("a");
  expect(document.querySelector("template")).toBeNull();
});

test("a chunk can contain a nested pending boundary", () => {
  document.body.innerHTML =
    '<div data-bones-slot="outer" busy aria-busy="true" inert><p>fallback</p></div>' +
    '<template data-bones-chunk="outer"><section>' +
    '<div data-bones-slot="inner" busy aria-busy="true" inert><p>inner fallback</p></div>' +
    "</section></template>";
  const run = swap();
  run("outer");
  const inner = document.querySelector('[data-bones-slot="inner"]')!;
  expect(inner.getAttribute("aria-busy")).toBe("true");
  document.body.insertAdjacentHTML(
    "beforeend",
    '<template data-bones-chunk="inner"><p>inner real</p></template>',
  );
  run("inner");
  expect(inner.innerHTML).toBe("<p>inner real</p>");
  expect(inner.hasAttribute("aria-busy")).toBe(false);
});
