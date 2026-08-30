import { afterEach, expect, test } from "vite-plus/test";
import "../../src/css/bones.css";

// ---------------------------------------------------------------------------
// BON-17: data-bones-animate must take effect from the element that carries
// it, not only from a wrapper. The animation variants live in @scope blocks,
// and a scoped selector's implicit :scope prefix only matches strict
// descendants, so without :is(:scope, :scope *) the attribute would be a
// silent no-op on the bone itself and on the aria-busy element.
// ---------------------------------------------------------------------------

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(html: string): HTMLElement {
  document.body.insertAdjacentHTML("beforeend", html);
  return document.body.lastElementChild as HTMLElement;
}

// --- explicit bones ---------------------------------------------------------

test("data-bones-animate on the explicit bone itself takes effect", () => {
  const root = mount(
    `<div aria-busy="true"><span data-bones-type="text" data-bones-animate="shimmer">hidden</span></div>`,
  );
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expect(bar.animationName).toBe("bone-shimmer");
});

test("data-bones-animate on a wrapper still animates explicit bones", () => {
  const root = mount(
    `<div data-bones-animate="pulse"><div aria-busy="true"><span data-bones-type="text">hidden</span></div></div>`,
  );
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expect(bar.animationName).toBe("bone-pulse");
});

test("an explicit bone opts out of a wrapper's animation with its own attribute", () => {
  const root = mount(
    `<div data-bones-animate="shimmer"><div aria-busy="true"><span data-bones-type="text" data-bones-animate="none">hidden</span></div></div>`,
  );
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expect(bar.animationName).toBe("none");
});

test("an explicit block carrying the attribute animates itself", () => {
  const root = mount(
    `<div aria-busy="true"><img data-bones-type="block" data-bones-animate="pulse" alt="avatar" width="48" height="48" /></div>`,
  );
  expect(getComputedStyle(root.querySelector("img")!).animationName).toBe("bone-pulse");
});

test("a multi-line bone carrying the attribute stills both pseudo-elements", () => {
  const root = mount(
    `<div aria-busy="true"><p data-bones-lines="3" data-bones-animate="none"></p></div>`,
  );
  const p = root.querySelector("p")!;
  expect(getComputedStyle(p, "::before").animationName).toBe("none");
  expect(getComputedStyle(p, "::after").animationName).toBe("none");
});

// --- inferred bones ---------------------------------------------------------

test("data-bones-animate='none' on the aria-busy element stops the default shimmer", () => {
  const root = mount(
    `<section aria-busy="true" data-bones-animate="none"><p>some copy</p></section>`,
  );
  const bar = getComputedStyle(root.querySelector("p")!, "::after");
  expect(bar.animationName).toBe("none");
});

test("data-bones-animate='pulse' on the aria-busy element switches its leaves", () => {
  const root = mount(
    `<section aria-busy="true" data-bones-animate="pulse"><p>some copy</p></section>`,
  );
  const bar = getComputedStyle(root.querySelector("p")!, "::after");
  expect(bar.animationName).toBe("bone-pulse");
});

test("data-bones-animate='none' on the aria-busy element also stills replaced elements", () => {
  const root = mount(
    `<section aria-busy="true" data-bones-animate="none"><img alt="avatar" width="48" height="48" /></section>`,
  );
  expect(getComputedStyle(root.querySelector("img")!).animationName).toBe("none");
});

test("data-bones-animate on a wrapper still governs an inferred region", () => {
  const root = mount(
    `<div data-bones-animate="none"><section aria-busy="true"><p>some copy</p></section></div>`,
  );
  const bar = getComputedStyle(root.querySelector("p")!, "::after");
  expect(bar.animationName).toBe("none");
});

test("an inner value on the aria-busy element beats an outer wrapper", () => {
  const root = mount(
    `<div data-bones-animate="shimmer"><section aria-busy="true" data-bones-animate="none"><p>some copy</p></section></div>`,
  );
  const bar = getComputedStyle(root.querySelector("p")!, "::after");
  expect(bar.animationName).toBe("none");
});

test("a busy leaf that is itself the busy element paints and honors the attribute", () => {
  const root = mount(`<div><p aria-busy="true" data-bones-animate="pulse">some copy</p></div>`);
  const bar = getComputedStyle(root.querySelector("p")!, "::after");
  expect(bar.animationName).toBe("bone-pulse");
});
