/// <reference types="vite-plus/client" />
import type { ReactNode } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, test } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import "../../src/element/index.ts";
import "../../src/css/auto.css";
import { createBones, forceBones } from "../../src/react/index.ts";

// ---------------------------------------------------------------------------
// One card, three renderers. auto.css restates the text-bar geometry from
// bones.css and only a selector-text test pins the copies; these screenshots
// pin what a user actually sees. data-bone-animate="none" everywhere so the
// shimmer cannot make an image non-deterministic.
// ---------------------------------------------------------------------------

const CARD_STYLE = "width: 320px; padding: 16px; font: 16px/1.5 sans-serif; background: #fff;";

const roots: Root[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) root.unmount();
  document.body.innerHTML = "";
});

function mountHtml(html: string): HTMLElement {
  document.body.insertAdjacentHTML("beforeend", html);
  return document.body.lastElementChild as HTMLElement;
}

function renderReact(node: ReactNode): HTMLElement {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  flushSync(() => root.render(node));
  return host.firstElementChild as HTMLElement;
}

function ReactCard() {
  const { bone } = createBones<{ title: string }>(forceBones);
  return (
    <div
      data-testid="react-card"
      data-bone-animate="none"
      style={{ width: 320, padding: 16, font: "16px/1.5 sans-serif", background: "#fff" }}
    >
      <div {...bone("block")} style={{ width: 48, height: 48 }} />
      <h3 {...bone("text")}>Placeholder title</h3>
      <p {...bone("text")}>Placeholder body copy that runs a little longer.</p>
    </div>
  );
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

test("react renderer with forceBones", async () => {
  renderReact(<ReactCard />);
  // @ts-expect-error — see the file-level comment above.
  await expect(page.getByTestId("react-card")).toMatchScreenshot("react-force");
});

test("element renderer with auto.css", async () => {
  mountHtml(
    `<bones-boundary force data-testid="element-card" data-bone-animate="none" style="${CARD_STYLE} display: block;">${CONTENT}</bones-boundary>`,
  );
  // @ts-expect-error — see the file-level comment above.
  await expect(page.getByTestId("element-card")).toMatchScreenshot("element-force");
});

test("bare aria-busy region with auto.css", async () => {
  mountHtml(
    `<div aria-busy="true" data-testid="bare-card" data-bone-animate="none" style="${CARD_STYLE}">${CONTENT}</div>`,
  );
  // @ts-expect-error — see the file-level comment above.
  await expect(page.getByTestId("bare-card")).toMatchScreenshot("bare-busy");
});

test("measured overlay over the card content", async () => {
  mountHtml(
    `<bones-boundary force precision="measured" data-testid="measured-card" data-bone-animate="none" style="${CARD_STYLE}">${CONTENT}</bones-boundary>`,
  );
  // @ts-expect-error — see the file-level comment above.
  await expect(page.getByTestId("measured-card")).toMatchScreenshot("measured-force");
});

test("the same card content, idle, for contrast", async () => {
  mountHtml(
    `<bones-boundary data-testid="idle-card" style="${CARD_STYLE} display: block;">${CONTENT}</bones-boundary>`,
  );
  // @ts-expect-error — see the file-level comment above.
  await expect(page.getByTestId("idle-card")).toMatchScreenshot("idle-content");
});
