import { afterEach, expect, test } from "vite-plus/test";
import "../../src/css/bones.css";

// ---------------------------------------------------------------------------
// BON-16: explicit bones shimmer by default, the same as inferred bones and
// the measured overlay. data-bones-animate="none" is the opt-out.
// ---------------------------------------------------------------------------

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(html: string): HTMLElement {
  document.body.insertAdjacentHTML("beforeend", html);
  return document.body.lastElementChild as HTMLElement;
}

test("an explicit text bone shimmers with no data-bones-animate anywhere", () => {
  const root = mount(`<div aria-busy="true"><span data-bones-type="text">hidden</span></div>`);
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expect(bar.animationName).toBe("bone-shimmer");
});

test("an explicit block bone shimmers with no data-bones-animate anywhere", () => {
  const root = mount(
    `<div aria-busy="true"><img data-bones-type="block" alt="avatar" width="48" height="48" /></div>`,
  );
  expect(getComputedStyle(root.querySelector("img")!).animationName).toBe("bone-shimmer");
});

test("an explicit block on a div shimmers and hides its children", () => {
  const root = mount(
    `<div aria-busy="true"><div data-bones-type="block"><p>hidden</p></div></div>`,
  );
  const block = root.querySelector("[data-bones-type]") as HTMLElement;
  expect(getComputedStyle(block).animationName).toBe("bone-shimmer");
  expect(getComputedStyle(root.querySelector("p")!).visibility).toBe("hidden");
});

test("the rows of a multi-line bone shimmer too", () => {
  const root = mount(`<div aria-busy="true"><p data-bones-lines="3"></p></div>`);
  const rows = getComputedStyle(root.querySelector("p")!, "::before");
  expect(rows.animationName).toBe("bone-shimmer");
});

test("data-bones-animate='none' on the bone itself opts out of the default", () => {
  const root = mount(
    `<div aria-busy="true"><span data-bones-type="text" data-bones-animate="none">hidden</span></div>`,
  );
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expect(bar.animationName).toBe("none");
});

test("data-bones-animate='none' on a wrapper opts its bones out of the default", () => {
  const root = mount(
    `<div data-bones-animate="none"><div aria-busy="true"><span data-bones-type="text">hidden</span></div></div>`,
  );
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expect(bar.animationName).toBe("none");
});

test("outside a busy region an explicit attribute is inert", () => {
  const root = mount(`<div><span data-bones-type="text">visible</span></div>`);
  const span = root.querySelector("span")!;
  expect(getComputedStyle(span, "::after").content).toBe("none");
  expect(getComputedStyle(span).position).toBe("static");
});
