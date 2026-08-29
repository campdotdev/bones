import { afterEach, expect, test } from "vite-plus/test";
import "../../src/css/bones.css";
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

test("explicit text bone bar derives from the inherited text color", () => {
  // Explicit bones shimmer by default (BON-16). The data-bones-animate="none"
  // wrapper collapses the gradient to a solid background-color; without it
  // the bar's paint lives in background-image.
  const root = mount(
    `<div data-bones-animate="none" style="${DARK_PAGE_TEXT}"><div aria-busy="true"><span data-bones-type="text">hidden</span></div></div>`,
  );
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expectColor(bar.backgroundColor, [238, 238, 238, 0.12]);
});

test("explicit image block hides its alt text but keeps the inherited channels", () => {
  const root = mount(
    `<div data-bones-animate="none" style="color: rgb(51, 51, 51)"><div aria-busy="true"><img data-bones-type="block" alt="avatar" width="48" height="48" /></div></div>`,
  );
  const img = getComputedStyle(root.querySelector("img")!);
  // Alt text stays invisible…
  expect(parseColor(img.color)[3]).toBe(0);
  // …but the bone still paints from the inherited color, not from transparent.
  expectColor(img.backgroundColor, [51, 51, 51, 0.12]);
});

test("inferred text leaf bar derives from the inherited text color", () => {
  const root = mount(
    `<div data-bones-animate="none"><section aria-busy="true" style="${DARK_PAGE_TEXT}"><p>some copy</p></section></div>`,
  );
  const bar = getComputedStyle(root.querySelector("p")!, "::after");
  expectColor(bar.backgroundColor, [238, 238, 238, 0.12]);
});

test("inferred block bone derives from the inherited text color", () => {
  const root = mount(
    `<div data-bones-animate="none"><section aria-busy="true" style="${DARK_PAGE_TEXT}"><img alt="avatar" width="48" height="48" /></section></div>`,
  );
  const img = getComputedStyle(root.querySelector("img")!);
  expectColor(img.backgroundColor, [238, 238, 238, 0.12]);
});

test("default text color keeps today's black-at-12% bones", () => {
  // Chromium's default color is black, so pages that never set a color get
  // exactly the value the library shipped before the derivation change.
  const root = mount(
    `<div data-bones-animate="none"><div aria-busy="true"><span data-bones-type="text">hidden</span></div></div>`,
  );
  const bar = getComputedStyle(root.querySelector("span")!, "::after");
  expectColor(bar.backgroundColor, [0, 0, 0, 0.12]);
});
