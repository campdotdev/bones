import { describe, expect, test } from "vite-plus/test";
import { measureBones, mergeLineRects, type Rect } from "../src/element/measure.ts";

// ---------------------------------------------------------------------------
// mergeLineRects is pure geometry: rects from Range.getClientRects, one per
// line fragment, merged into one bar per visual line. Two rects share a line
// when they overlap vertically by at least half the shorter height; same-line
// neighbors merge when the horizontal gap is at most half the taller height.
// ---------------------------------------------------------------------------

const rect = (left: number, top: number, width: number, height: number): Rect => ({
  left,
  top,
  width,
  height,
});

describe("mergeLineRects", () => {
  test("adjacent fragments on one line merge into one bar", () => {
    // "Hello <strong>world</strong>" — a 4px space between fragments, 16px line.
    const merged = mergeLineRects([rect(0, 0, 40, 16), rect(44, 0, 40, 16)]);
    expect(merged).toEqual([rect(0, 0, 84, 16)]);
  });

  test("a gap wider than half the line height stays two bars", () => {
    // Two columns 40px apart.
    const merged = mergeLineRects([rect(0, 0, 100, 16), rect(140, 0, 100, 16)]);
    expect(merged).toHaveLength(2);
  });

  test("separate lines never merge", () => {
    const merged = mergeLineRects([rect(0, 0, 100, 16), rect(0, 24, 60, 16)]);
    expect(merged).toEqual([rect(0, 0, 100, 16), rect(0, 24, 60, 16)]);
  });

  test("mixed heights on one line merge and take the union box", () => {
    // Inline code or a larger inline span: same baseline area, taller box.
    const merged = mergeLineRects([rect(0, 4, 40, 16), rect(42, 0, 30, 24)]);
    expect(merged).toEqual([rect(0, 0, 72, 24)]);
  });

  test("input order does not matter", () => {
    const merged = mergeLineRects([rect(44, 0, 40, 16), rect(0, 24, 60, 16), rect(0, 0, 40, 16)]);
    expect(merged).toEqual([rect(0, 0, 84, 16), rect(0, 24, 60, 16)]);
  });

  test("empty input yields empty output", () => {
    expect(mergeLineRects([])).toEqual([]);
  });
});

describe("measureBones in jsdom", () => {
  test("returns no bones without a layout engine", () => {
    // jsdom has no layout: rects are zero-area or getClientRects is missing.
    // Empty result is the signal to stay on the CSS path.
    const root = document.createElement("div");
    root.innerHTML = "<p>copy</p><img alt=''>";
    document.body.append(root);
    expect(measureBones(root)).toEqual([]);
    root.remove();
  });
});
