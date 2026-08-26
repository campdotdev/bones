import { afterEach, expect, test } from "vite-plus/test";
import "../../src/css/auto.css";
import { expectColor, parseColor } from "./expect-color.ts";

// ---------------------------------------------------------------------------
// BON-13: bone colors derive from the inherited text color, not the OS
// scheme. A dark-mode OS over a page that stays light used to paint white
// bones on a white canvas; deriving from the text color inherits the page's
// own contrast guarantee instead. The trap: bones hide their content via the
// color property, so the derivation must survive that (alpha-zeroed
// currentColor, channels intact) rather than read a transparent currentColor.
// ---------------------------------------------------------------------------

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(html: string): HTMLElement {
  document.body.insertAdjacentHTML("beforeend", html);
  return document.body.lastElementChild as HTMLElement;
}

const DARK_PAGE_TEXT = "color: rgb(238, 238, 238)";

test("text bone bar derives from the inherited text color", () => {
  const root = mount(`<div style="${DARK_PAGE_TEXT}"><span data-bone="text">hidden</span></div>`);
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expectColor(bar.backgroundColor, [238, 238, 238, 0.12]);
});

test("image block bone hides its alt text but keeps the inherited channels", () => {
  const root = mount(
    `<div style="color: rgb(51, 51, 51)"><img data-bone="block" alt="avatar" width="48" height="48" /></div>`,
  );
  const img = getComputedStyle(root.querySelector("img")!);
  // Alt text stays invisible…
  expect(parseColor(img.color)[3]).toBe(0);
  // …but the bone still paints from the inherited color, not from transparent.
  expectColor(img.backgroundColor, [51, 51, 51, 0.12]);
});

test("auto.css text leaf bar derives from the inherited text color", () => {
  // The data-bone-animate="none" wrapper collapses the shimmer gradient to a
  // solid background-color; without it the bar's paint lives in
  // background-image. The attribute must wrap the busy region — its @scope
  // does not take effect from the aria-busy element itself.
  const root = mount(
    `<div data-bone-animate="none"><section aria-busy="true" style="${DARK_PAGE_TEXT}"><p>some copy</p></section></div>`,
  );
  const bar = getComputedStyle(root.querySelector("p")!, "::after");
  expectColor(bar.backgroundColor, [238, 238, 238, 0.12]);
});

test("auto.css block bone derives from the inherited text color", () => {
  const root = mount(
    `<div data-bone-animate="none"><section aria-busy="true" style="${DARK_PAGE_TEXT}"><img alt="avatar" width="48" height="48" /></section></div>`,
  );
  const img = getComputedStyle(root.querySelector("img")!);
  expectColor(img.backgroundColor, [238, 238, 238, 0.12]);
});

test("default text color keeps today's black-at-12% bones", () => {
  // Chromium's default color is black, so pages that never set a color get
  // exactly the value the library shipped before the derivation change.
  const root = mount(`<div><span data-bone="text">hidden</span></div>`);
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expectColor(bar.backgroundColor, [0, 0, 0, 0.12]);
});
