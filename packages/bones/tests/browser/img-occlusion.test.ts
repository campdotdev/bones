import { afterEach, expect, test } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import "../../src/css/auto.css";

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
  // The vendored runner has no `save: false`; the file it writes lands in
  // __screenshots__/img-occlusion.test.ts/, which .gitignore covers.
  const shot = await page.elementLocator(el).screenshot({ base64: true });
  const png = new Image();
  png.src = `data:image/png;base64,${shot.base64}`;
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

test("control: outside a busy region a loaded image paints its own pixels", async () => {
  const img = await mountImage(
    `<div style="color: rgb(0, 0, 255); background: #fff"><img src="${RED_PNG}" width="48" height="48" alt="" /></div>`,
  );
  expect(await centerPixel(img)).toEqual([255, 0, 0]);
});

test("auto.css: a loaded image inside a busy region is covered by its bone", async () => {
  const img = await mountImage(
    `<section aria-busy="true" data-bone-animate="none" style="color: rgb(0, 0, 255); background: #fff"><img src="${RED_PNG}" width="48" height="48" alt="" /></section>`,
  );
  const [r, g, b] = await centerPixel(img);
  // --bone-base is the text color at 12% over white: a pale blue, never red.
  expect(r).toBeLessThan(250);
  expect(b).toBeGreaterThan(g);
});

test("bones.css: a loaded image marked as a block bone is covered by its bone", async () => {
  const img = await mountImage(
    `<div data-bone-animate="none" style="color: rgb(0, 0, 255); background: #fff"><img data-bone="block" src="${RED_PNG}" width="48" height="48" alt="" /></div>`,
  );
  const [r, g, b] = await centerPixel(img);
  expect(r).toBeLessThan(250);
  expect(b).toBeGreaterThan(g);
});
