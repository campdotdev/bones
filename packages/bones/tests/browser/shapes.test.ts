import { afterEach, expect, test } from "vite-plus/test";
import "../../src/css/bones.css";

// ---------------------------------------------------------------------------
// The shapes the visual baselines cover, pinned by computed style so the
// contract stays green independent of screenshot harvesting: a multi-line
// element is N line heights tall, an img with no src becomes a box, a padded
// leaf keeps its bar inside its padding, and data-bones-length sets a width.
// ---------------------------------------------------------------------------

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(html: string): HTMLElement {
  document.body.insertAdjacentHTML("beforeend", html);
  return document.body.lastElementChild as HTMLElement;
}

test("a data-bones-lines element is N line heights tall and block-level", () => {
  const root = mount(
    `<div aria-busy="true" style="font: 16px/1.5 sans-serif"><p data-bones-lines="3" style="margin: 0"></p></div>`,
  );
  const p = root.querySelector("p")!;
  const style = getComputedStyle(p);
  expect(style.display).toBe("block");
  expect(p.getBoundingClientRect().height).toBeCloseTo(3 * 24, 0);
  // The stylesheet sets a single mask-repeat for a three-layer mask-image;
  // Chromium's computed style expands the shorthand's single value to one
  // per layer instead of reporting it back verbatim.
  expect(getComputedStyle(p, "::before").maskRepeat).toBe("repeat-y, repeat-y, repeat-y");
});

test("an out-of-range line count still paints where attr() is supported", () => {
  const root = mount(
    `<div aria-busy="true" style="font: 16px/1.5 sans-serif"><p data-bones-lines="12" style="margin: 0"></p></div>`,
  );
  const p = root.querySelector("p")!;
  if (CSS.supports("x: attr(x type(*))")) {
    expect(p.getBoundingClientRect().height).toBeCloseTo(12 * 24, 0);
  } else {
    expect(p.getBoundingClientRect().height).toBeCloseTo(24, 0);
  }
});

test("an img with no src becomes a sized box with no alt rendering", () => {
  const root = mount(
    `<div aria-busy="true"><img alt="Pikachu" width="64" height="64" /> <img alt="Pikachu" src="" width="64" height="64" /></div>`,
  );
  for (const img of root.querySelectorAll("img")) {
    const style = getComputedStyle(img);
    expect(style.display).toBe("inline-block");
    expect(style.content.startsWith('url("data:image/gif;base64,')).toBe(true);
    const rect = img.getBoundingClientRect();
    expect(rect.width).toBe(64);
    expect(rect.height).toBe(64);
  }
});

test("outside a busy region an img with no src is left alone", () => {
  const root = mount(`<div><img alt="Pikachu" width="64" height="64" /></div>`);
  expect(getComputedStyle(root.querySelector("img")!).content).toBe("normal");
});

const PILL =
  "display: inline-block; font: 12px/1.6 sans-serif; padding: 0.2em 0.6em; border-radius: 999px; background: #eee";

test("a padded inline-block leaf in a flex row keeps its content width and its bar stays inside the padding", () => {
  const root = mount(
    `<div aria-busy="true" style="width: 320px; font: 16px/1.5 sans-serif">
       <div style="display: flex; gap: 6px"><span style="${PILL}"></span><span style="${PILL}"></span></div>
     </div>`,
  );
  const [pill] = root.querySelectorAll("span");
  const probe = mount(
    `<span style="${PILL}"><span style="display: inline-block; width: 4ch"></span></span>`,
  );
  // 4ch of content plus the pill's own padding, not 85% of the row.
  expect(pill.getBoundingClientRect().width).toBeLessThan(0.5 * 320);
  expect(pill.getBoundingClientRect().width).toBeCloseTo(probe.getBoundingClientRect().width, 0);
  const bar = getComputedStyle(pill, "::after");
  expect(bar.paddingLeft).toBe(getComputedStyle(pill).paddingLeft);
  expect(bar.paddingTop).toBe(getComputedStyle(pill).paddingTop);
  expect(bar.boxSizing).toBe("content-box");
  expect(bar.clipPath).toContain("content-box");
});

test("a block leaf still takes its share of the width", () => {
  const root = mount(
    `<div aria-busy="true" style="width: 320px; font: 16px/1.5 sans-serif"><h3 style="margin: 0"></h3></div>`,
  );
  expect(root.querySelector("h3")!.getBoundingClientRect().width).toBeCloseTo(0.85 * 320, 0);
});

test("data-bones-length sets the width in characters on block and inline-block leaves", () => {
  const root = mount(
    `<div aria-busy="true" style="width: 320px; font: 16px/1.5 sans-serif">
       <h3 style="margin: 0; font: 16px/1.5 sans-serif" data-bones-length="9"></h3>
       <span style="${PILL}" data-bones-length="7"></span>
       <span data-bones-length="12"></span>
     </div>`,
  );
  // Probes sit in <body>, whose default font is a serif; match the fixture's.
  const ch = (n: number, style = "font: 16px/1.5 sans-serif") => {
    const probe = mount(`<span style="display: inline-block; width: ${n}ch; ${style}"></span>`);
    return probe.getBoundingClientRect().width;
  };
  expect(root.querySelector("h3")!.getBoundingClientRect().width).toBeCloseTo(ch(9), 0);
  const [pill, inline] = root.querySelectorAll("span");
  const pad = parseFloat(getComputedStyle(pill).paddingLeft);
  expect(pill.getBoundingClientRect().width).toBeCloseTo(
    ch(7, "font: 12px/1.6 sans-serif") + 2 * pad,
    0,
  );
  // width does nothing on an inline box; the empty leaf's ::before carries it.
  expect(inline.getBoundingClientRect().width).toBeCloseTo(ch(12), 0);
});

test("a page reset that zeroes padding on ::after does not pull the bar out of the padding", () => {
  const reset = document.createElement("style");
  reset.textContent = "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }";
  document.head.append(reset);
  try {
    const root = mount(
      `<div aria-busy="true" style="font: 16px/1.5 sans-serif"><span style="${PILL}"></span></div>`,
    );
    const pill = root.querySelector("span")!;
    const bar = getComputedStyle(pill, "::after");
    expect(bar.paddingLeft).toBe(getComputedStyle(pill).paddingLeft);
    expect(bar.boxSizing).toBe("content-box");
  } finally {
    reset.remove();
  }
});

test("a length on an element outside a busy region does not reach a busy region nested below it", () => {
  const root = mount(
    `<div data-bones-length="30" style="width: 320px; font: 16px/1.5 sans-serif">
       <div aria-busy="true"><h3 style="margin: 0" data-bones-lines="2"></h3><span></span></div>
     </div>`,
  );
  const probe = mount(
    `<span style="display: inline-block; width: 4ch; font: 16px/1.5 sans-serif"></span>`,
  );
  expect(root.querySelector("span")!.getBoundingClientRect().width).toBeCloseTo(
    probe.getBoundingClientRect().width,
    0,
  );
});

test("a line count outside a busy region does not reach a busy region nested below it", () => {
  // The bone inside is explicit: an ancestor with data-bones-lines exempts
  // its descendants from inference, so an inferred leaf would paint nothing
  // here and the inherited count would not show.
  const root = mount(
    `<div data-bones-lines="5" style="width: 320px; font: 16px/1.5 sans-serif">
       <div aria-busy="true"><p data-bones-type="text" style="margin: 0"></p></div>
     </div>`,
  );
  expect(root.querySelector("p")!.getBoundingClientRect().height).toBeCloseTo(24, 0);
});
