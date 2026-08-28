import { afterEach, expect, test } from "vite-plus/test";
import "../../src/css/bones.css";

// ---------------------------------------------------------------------------
// BON-16: marked bones shimmer by default, the same as auto bones and the
// measured overlay. Before this, bones.css only animated inside a
// data-bone-animate scope, so a page mixing an aria-busy region with explicit
// data-bone markup showed shimmering auto bones beside frozen marked ones.
// data-bone-animate="none" is the opt-out.
// ---------------------------------------------------------------------------

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(html: string): HTMLElement {
  document.body.insertAdjacentHTML("beforeend", html);
  return document.body.lastElementChild as HTMLElement;
}

test("a text bone shimmers with no data-bone-animate anywhere", () => {
  const root = mount(`<div><span data-bone="text">hidden</span></div>`);
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expect(bar.animationName).toBe("bone-shimmer");
});

test("a block bone shimmers with no data-bone-animate anywhere", () => {
  const root = mount(`<div><img data-bone="block" alt="avatar" width="48" height="48" /></div>`);
  expect(getComputedStyle(root.querySelector("img")!).animationName).toBe("bone-shimmer");
});

test("a container bone's cover shimmers with no data-bone-animate anywhere", () => {
  const root = mount(`<div><div data-bone="container"><p>hidden</p></div></div>`);
  const cover = getComputedStyle(root.querySelector("[data-bone]")!, "::before");
  expect(cover.animationName).toBe("bone-shimmer");
});

test("data-bone-animate='none' on the bone itself opts out of the default", () => {
  const root = mount(`<div><span data-bone="text" data-bone-animate="none">hidden</span></div>`);
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expect(bar.animationName).toBe("none");
});

test("data-bone-animate='none' on a wrapper opts its bones out of the default", () => {
  const root = mount(`<div data-bone-animate="none"><span data-bone="text">hidden</span></div>`);
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expect(bar.animationName).toBe("none");
});
