import { afterEach, expect, test } from "vite-plus/test";
import "../../src/css/bones.css";

// ---------------------------------------------------------------------------
// BON-17: data-bone-animate must take effect from the element that carries it,
// not only from a wrapper. The animation variants live in @scope blocks, and a
// scoped selector's implicit :scope prefix only matches strict descendants —
// so the attribute was a silent no-op on the marked bone itself and on the
// aria-busy element of an auto region.
// ---------------------------------------------------------------------------

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(html: string): HTMLElement {
  document.body.insertAdjacentHTML("beforeend", html);
  return document.body.lastElementChild as HTMLElement;
}

// --- marked bones (the marked half of bones.css) ----------------------------

test("data-bone-animate on the marked bone itself takes effect", () => {
  const root = mount(`<div><span data-bone="text" data-bone-animate="shimmer">hidden</span></div>`);
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expect(bar.animationName).toBe("bone-shimmer");
});

test("data-bone-animate on a wrapper still animates marked bones", () => {
  const root = mount(`<div data-bone-animate="pulse"><span data-bone="text">hidden</span></div>`);
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expect(bar.animationName).toBe("bone-pulse");
});

test("a marked bone opts out of a wrapper's animation with its own attribute", () => {
  const root = mount(
    `<div data-bone-animate="shimmer"><span data-bone="text" data-bone-animate="none">hidden</span></div>`,
  );
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expect(bar.animationName).toBe("none");
});

test("a block bone carrying the attribute animates itself", () => {
  const root = mount(
    `<div><img data-bone="block" data-bone-animate="pulse" alt="avatar" width="48" height="48" /></div>`,
  );
  const img = getComputedStyle(root.querySelector("img")!);
  expect(img.animationName).toBe("bone-pulse");
});

// --- auto bones (aria-busy regions) -----------------------------------------

test("data-bone-animate='none' on the aria-busy element stops the default shimmer", () => {
  const root = mount(
    `<section aria-busy="true" data-bone-animate="none"><p>some copy</p></section>`,
  );
  const bar = getComputedStyle(root.querySelector("p")!, "::after");
  expect(bar.animationName).toBe("none");
});

test("data-bone-animate='pulse' on the aria-busy element switches its leaves", () => {
  const root = mount(
    `<section aria-busy="true" data-bone-animate="pulse"><p>some copy</p></section>`,
  );
  const bar = getComputedStyle(root.querySelector("p")!, "::after");
  expect(bar.animationName).toBe("bone-pulse");
});

test("data-bone-animate='none' on the aria-busy element also stills replaced elements", () => {
  const root = mount(
    `<section aria-busy="true" data-bone-animate="none"><img alt="avatar" width="48" height="48" /></section>`,
  );
  expect(getComputedStyle(root.querySelector("img")!).animationName).toBe("none");
});

test("data-bone-animate on a wrapper still governs an auto region", () => {
  const root = mount(
    `<div data-bone-animate="none"><section aria-busy="true"><p>some copy</p></section></div>`,
  );
  const bar = getComputedStyle(root.querySelector("p")!, "::after");
  expect(bar.animationName).toBe("none");
});

test("an inner value on the aria-busy element beats an outer wrapper", () => {
  const root = mount(
    `<div data-bone-animate="shimmer"><section aria-busy="true" data-bone-animate="none"><p>some copy</p></section></div>`,
  );
  const bar = getComputedStyle(root.querySelector("p")!, "::after");
  expect(bar.animationName).toBe("none");
});
