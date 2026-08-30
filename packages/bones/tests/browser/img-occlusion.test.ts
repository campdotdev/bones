import { afterEach, expect, test } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import "../../src/css/bones.css";
import { parseColor } from "./expect-color.ts";

// ---------------------------------------------------------------------------
// BON-15: a block bone must cover an image that has already loaded. A loaded
// opaque image paints over its own background-color, so setting the bone
// color on the img is not enough; the picture itself has to leave the box.
// Computed style cannot see paint, so these tests screenshot the element and
// sample its center pixel.
// ---------------------------------------------------------------------------

/** A solid red PNG, drawn rather than hand-encoded so it always decodes. */
const RED_PNG = (() => {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 4;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "rgb(255, 0, 0)";
  context.fillRect(0, 0, 4, 4);
  return canvas.toDataURL("image/png");
})();

const PAGE = "color: rgb(0, 0, 255); background: rgb(255, 255, 255)";

afterEach(() => {
  document.body.innerHTML = "";
});

async function mountImage(html: string): Promise<HTMLImageElement> {
  document.body.insertAdjacentHTML("beforeend", html);
  const img = document.body.querySelector("img")!;
  await img.decode();
  return img;
}

/** RGB of the pixel at the center of `el` as painted. */
async function centerPixel(el: HTMLElement): Promise<[number, number, number]> {
  // With save: false the runner returns the base64 string itself rather than
  // writing a file; the `{ path, base64 }` shape is what a saved shot returns.
  const shot: unknown = await page.elementLocator(el).screenshot({ base64: true, save: false });
  const base64 = typeof shot === "string" ? shot : (shot as { base64: string }).base64;
  const png = new Image();
  png.src = `data:image/png;base64,${base64}`;
  await png.decode();
  const canvas = document.createElement("canvas");
  canvas.width = png.width;
  canvas.height = png.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(png, 0, 0);
  const { data } = context.getImageData(
    Math.floor(png.width / 2),
    Math.floor(png.height / 2),
    1,
    1,
  );
  return [data[0], data[1], data[2]];
}

/** The bone's own color composited over the white page, per channel. */
function expectedBonePixel(el: HTMLElement): [number, number, number] {
  const [r, g, b, a] = parseColor(getComputedStyle(el).backgroundColor);
  const over = (channel: number) => Math.round(channel * a + 255 * (1 - a));
  return [over(r), over(g), over(b)];
}

async function expectBonePixel(img: HTMLImageElement): Promise<void> {
  const actual = await centerPixel(img);
  const expected = expectedBonePixel(img);
  for (let i = 0; i < 3; i++) expect(Math.abs(actual[i] - expected[i])).toBeLessThanOrEqual(2);
}

test("control: outside a busy region a loaded image paints its own pixels", async () => {
  const img = await mountImage(
    `<div style="${PAGE}"><img src="${RED_PNG}" width="48" height="48" alt="" /></div>`,
  );
  expect(await centerPixel(img)).toEqual([255, 0, 0]);
});

test("inferred: a loaded image inside a busy region paints its bone color", async () => {
  const img = await mountImage(
    `<section aria-busy="true" data-bones-animate="none" style="${PAGE}"><img src="${RED_PNG}" width="48" height="48" alt="" /></section>`,
  );
  await expectBonePixel(img);
});

test("explicit: a loaded image marked as a block bone paints its bone color", async () => {
  const img = await mountImage(
    `<div aria-busy="true" data-bones-animate="none" style="${PAGE}"><img data-bones-type="block" src="${RED_PNG}" width="48" height="48" alt="" /></div>`,
  );
  await expectBonePixel(img);
});
