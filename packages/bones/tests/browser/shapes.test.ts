import { afterEach, expect, test } from "vite-plus/test";
import "../../src/css/bones.css";

// ---------------------------------------------------------------------------
// The two shapes the visual baselines cover, pinned by computed style so the
// contract stays green independent of screenshot harvesting: a multi-line
// element is N line heights tall, and an img with no src becomes a box.
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
