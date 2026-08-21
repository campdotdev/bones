import { describe, expect, test } from "vite-plus/test";
import {
  boneAttributes,
  isMinMax,
  minMax,
  resolveLength,
  TRANSPARENT_PIXEL,
} from "../src/core/attributes.ts";

describe("boneAttributes", () => {
  test("text bone has data-bone and aria-busy only", () => {
    expect(boneAttributes("text")).toEqual({ "data-bone": "text", "aria-busy": true });
  });

  test("text bone with length sets --bone-length", () => {
    expect(boneAttributes("text", { length: 12 })).toEqual({
      "data-bone": "text",
      "aria-busy": true,
      style: { "--bone-length": 12 },
    });
  });

  test("contained text bone sets --bone-contained", () => {
    expect(boneAttributes("text", { contained: true, length: 7 })).toEqual({
      "data-bone": "text",
      "aria-busy": true,
      style: { "--bone-contained": 1, "--bone-length": 7 },
    });
  });

  test("block bone carries the transparent pixel src", () => {
    expect(boneAttributes("block")).toEqual({
      "data-bone": "block",
      "aria-busy": true,
      src: TRANSPARENT_PIXEL,
    });
  });

  test("container bone has no style or src", () => {
    expect(boneAttributes("container")).toEqual({
      "data-bone": "container",
      "aria-busy": true,
    });
  });

  test("options are ignored for non-text bones", () => {
    expect(boneAttributes("block", { length: 5 }).style).toBeUndefined();
  });
});

describe("resolveLength", () => {
  test("passes plain numbers through", () => {
    expect(resolveLength(9, 0)).toBe(9);
    expect(resolveLength(9, 3)).toBe(9);
  });

  test("returns undefined for undefined", () => {
    expect(resolveLength(undefined, 3)).toBeUndefined();
  });

  test("minMax varies deterministically with call index", () => {
    const range = minMax(4, 12);
    const widths = [0, 1, 2, 3].map((i) => resolveLength(range, i));
    // min + ((i * 7 + 3) % 9)
    expect(widths).toEqual([7, 5, 12, 10]);
  });

  test("minMax stays within bounds", () => {
    const range = minMax(4, 12);
    for (let i = 0; i < 50; i++) {
      const width = resolveLength(range, i);
      expect(width).toBeGreaterThanOrEqual(4);
      expect(width).toBeLessThanOrEqual(12);
    }
  });
});

describe("minMax", () => {
  test("isMinMax accepts minMax descriptors and rejects lookalikes", () => {
    expect(isMinMax(minMax(1, 2))).toBe(true);
    expect(isMinMax({ min: 1, max: 2 })).toBe(false);
    expect(isMinMax(null)).toBe(false);
    expect(isMinMax(7)).toBe(false);
  });
});
