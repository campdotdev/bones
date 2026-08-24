import { expect, test } from "vite-plus/test";

// Proves the browser project runs in a real layout engine: jsdom returns
// all-zero rects, Chromium cannot.
test("layout engine is real", () => {
  const el = document.createElement("div");
  el.textContent = "measure me";
  el.style.font = "16px/1.5 monospace";
  document.body.append(el);
  const rect = el.getBoundingClientRect();
  expect(rect.height).toBeGreaterThan(0);
  expect(rect.width).toBeGreaterThan(0);
  el.remove();
});
