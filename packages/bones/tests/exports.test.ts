import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";

// The package's public shape. Anything not listed here is not shipped.
const pkg = JSON.parse(readFileSync(join(import.meta.dirname, "../package.json"), "utf8"));

describe("package.json", () => {
  test("exports exactly the root, the server entry, the stylesheet, and package.json", () => {
    expect(Object.keys(pkg.exports).sort()).toEqual([".", "./css", "./package.json", "./server"]);
    expect(pkg.exports["."]).toBe("./dist/index.mjs");
    expect(pkg.exports["./server"]).toBe("./dist/server/index.mjs");
  });

  test("registers the element on import, so the root is a side effect", () => {
    expect(pkg.sideEffects).toEqual(["*.css", "./dist/index.mjs"]);
  });

  test("has no React dependency of any kind", () => {
    const all = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };
    expect(Object.keys(all).filter((name) => /react/.test(name))).toEqual([]);
    expect(pkg.peerDependencies).toBeUndefined();
    expect(pkg.peerDependenciesMeta).toBeUndefined();
  });

  test("describes itself without a framework", () => {
    expect(pkg.description).toBe(
      "Automatic skeleton loaders for any stack. One stylesheet, one custom element.",
    );
  });
});
