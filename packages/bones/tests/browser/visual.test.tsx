/// <reference types="vite-plus/client" />
import { afterEach, expect, test } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import "../../src/css/bones.css";

// ---------------------------------------------------------------------------
// One card, explicit and inferred, plus the shapes only a screenshot can check:
// multi-line bars, a block on a div, an img with no src. The selector tests
// pin the two copies of the bar geometry equal; these screenshots pin what a
// user sees. data-bones-animate="none" everywhere so the shimmer cannot make
// an image non-deterministic.
// ---------------------------------------------------------------------------

const CARD_STYLE = "width: 320px; padding: 16px; font: 16px/1.5 sans-serif; background: #fff;";

afterEach(() => {
  document.body.innerHTML = "";
});

function mountHtml(html: string): HTMLElement {
  document.body.insertAdjacentHTML("beforeend", html);
  return document.body.lastElementChild as HTMLElement;
}

const CONTENT = `
  <img alt="" width="48" height="48" />
  <h3>Real title</h3>
  <p>Real body copy that runs a little longer than one line at this width.</p>
  <button type="button">Save</button>
`;

// Each `toMatchScreenshot` call below needs a suppression for the same
// upstream typing gap documented on the `toMatchScreenshot` config key in
// vite.config.ts: vite-plus-test's `declare module "vitest/node"`
// augmentation targets the real `vitest` package, not vite-plus's vendored
// internal copy, so `Assertion<Locator>` here has no merged type even
// though the matcher exists and passes at runtime (proven by this file).

test("explicit markup under a busy wrapper", async () => {
  mountHtml(
    `<div aria-busy="true" data-testid="explicit-card" data-bones-animate="none" style="${CARD_STYLE}">
       <div data-bones-type="block" style="width: 48px; height: 48px"></div>
       <h3 data-bones-type="text">Placeholder title</h3>
       <p data-bones-type="text">Placeholder body copy that runs a little longer.</p>
     </div>`,
  );
  // @ts-expect-error — see the file-level comment above.
  await expect(page.getByTestId("explicit-card")).toMatchScreenshot("explicit-force");
});

test("bare aria-busy region with inferred rules", async () => {
  mountHtml(
    `<div aria-busy="true" data-testid="bare-card" data-bones-animate="none" style="${CARD_STYLE}">${CONTENT}</div>`,
  );
  // @ts-expect-error — see the file-level comment above.
  await expect(page.getByTestId("bare-card")).toMatchScreenshot("bare-busy");
});

test("the same card content, idle, for contrast", async () => {
  mountHtml(`<div data-testid="idle-card" style="${CARD_STYLE}">${CONTENT}</div>`);
  // @ts-expect-error — see the file-level comment above.
  await expect(page.getByTestId("idle-card")).toMatchScreenshot("idle-content");
});

test("three lines at 16px/1.5", async () => {
  mountHtml(
    `<div aria-busy="true" data-testid="lines-16" data-bones-animate="none" style="${CARD_STYLE}"><p data-bones-lines="3"></p></div>`,
  );
  // @ts-expect-error — see the file-level comment above.
  await expect(page.getByTestId("lines-16")).toMatchScreenshot("lines-16");
});

test("five lines at 24px/1.3 with a pill radius", async () => {
  mountHtml(
    `<div aria-busy="true" data-testid="lines-24" data-bones-animate="none" style="${CARD_STYLE} font: 24px/1.3 sans-serif; --bone-radius: 999px;"><p data-bones-lines="5"></p></div>`,
  );
  // @ts-expect-error — see the file-level comment above.
  await expect(page.getByTestId("lines-24")).toMatchScreenshot("lines-24");
});

test("a block on a div hides its children", async () => {
  mountHtml(
    `<div aria-busy="true" data-testid="block-div" data-bones-animate="none" style="${CARD_STYLE}"><div data-bones-type="block" style="width: 96px; height: 96px"><p>hidden</p></div></div>`,
  );
  // @ts-expect-error — see the file-level comment above.
  await expect(page.getByTestId("block-div")).toMatchScreenshot("block-div");
});

test("an img with no src and one with an empty src get clean boxes", async () => {
  mountHtml(
    `<div aria-busy="true" data-testid="img-no-src" data-bones-animate="none" style="${CARD_STYLE}"><img alt="Pikachu" width="64" height="64" /> <img alt="Pikachu" src="" width="64" height="64" /></div>`,
  );
  // @ts-expect-error — see the file-level comment above.
  await expect(page.getByTestId("img-no-src")).toMatchScreenshot("img-no-src");
});

test("padded pills in a flex row, with lengths on the title and the pills", async () => {
  const pill =
    "display: inline-block; font: 12px/1.6 sans-serif; padding: 0.2em 0.6em; border-radius: 999px; background: #e5e7eb;";
  mountHtml(
    `<div aria-busy="true" data-testid="pill-row" data-bones-animate="none" style="${CARD_STYLE} text-align: center;">
       <h3 data-bones-length="9" style="margin: 0 auto 8px"></h3>
       <div style="display: flex; gap: 6px; justify-content: center">
         <span data-bones-length="7" style="${pill}"></span><span data-bones-length="7" style="${pill}"></span>
       </div>
       <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px">
         ${`<span style="${pill}"></span>`.repeat(5)}
       </div>
     </div>`,
  );
  // @ts-expect-error — see the file-level comment above.
  await expect(page.getByTestId("pill-row")).toMatchScreenshot("pill-row");
});
