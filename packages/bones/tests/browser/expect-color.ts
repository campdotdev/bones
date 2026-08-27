import { expect } from "vite-plus/test";

// Chromium serializes the same computed color as "rgba(r, g, b, a)" in the
// light DOM but "color(srgb r g b / a)" inside shadow roots and for relative
// colors. Compare channels, not strings.
export function parseColor(value: string): [number, number, number, number] {
  let m = value.match(/^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/);
  if (m) return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
  m = value.match(/^color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
  if (m) return [+m[1] * 255, +m[2] * 255, +m[3] * 255, m[4] === undefined ? 1 : +m[4]];
  throw new Error(`unrecognized color: ${value}`);
}

export function expectColor(value: string, [r, g, b, a]: [number, number, number, number]): void {
  const [vr, vg, vb, va] = parseColor(value);
  expect(vr).toBeCloseTo(r, 0);
  expect(vg).toBeCloseTo(g, 0);
  expect(vb).toBeCloseTo(b, 0);
  expect(va).toBeCloseTo(a, 2);
}
