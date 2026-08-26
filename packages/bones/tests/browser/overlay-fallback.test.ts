import { afterEach, test } from "vite-plus/test";
import "../../src/element/index.ts";
import type { BonesBoundary } from "../../src/element/index.ts";
import { expectColor } from "./expect-color.ts";

// ---------------------------------------------------------------------------
// BON-13, shadow overlay edition: when no stylesheet is loaded, the measured
// bars fall back to the literals baked into the overlay's shadow CSS. Those
// fallbacks must derive from the host's inherited color like the stylesheet
// does — a fixed rgba(0,0,0,…) fallback disappears on a dark page.
// Deliberately no CSS imports in this file.
// ---------------------------------------------------------------------------

afterEach(() => {
  document.body.innerHTML = "";
});

test("measured bars without stylesheets derive from the inherited color", () => {
  document.body.insertAdjacentHTML(
    "beforeend",
    `<bones-boundary force precision="measured" transition="none" min-duration="0"
       data-bone-animate="none"
       style="width: 20ch; font: 16px/1.5 monospace; color: rgb(238, 238, 238);">
       <p style="margin: 0">aaaa bbbb</p>
     </bones-boundary>`,
  );
  const el = document.querySelector<BonesBoundary>("bones-boundary")!;
  const bar = el.shadowRoot!.querySelector<HTMLElement>('[part~="bone"]')!;
  expectColor(getComputedStyle(bar).backgroundColor, [238, 238, 238, 0.12]);
});
