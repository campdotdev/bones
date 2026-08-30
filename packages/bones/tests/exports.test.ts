import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vite-plus/test";

// The package's public shape. Anything not listed here is not shipped.
const pkg = JSON.parse(readFileSync(join(import.meta.dirname, "../package.json"), "utf8"));

describe("package.json", () => {
  test("exports exactly the stylesheet and package.json", () => {
    expect(Object.keys(pkg.exports).sort()).toEqual(["./css", "./package.json"]);
    expect(pkg.exports["./css"]).toEqual({
      style: "./src/css/bones.css",
      default: "./src/css/bones.css",
    });
  });

  test("ships the stylesheet source and nothing built", () => {
    expect(pkg.files).toEqual(["src/css"]);
    expect(pkg.sideEffects).toEqual(["*.css"]);
    expect(pkg.scripts.build).toBeUndefined();
    expect(pkg.scripts.prepublishOnly).toBeUndefined();
  });

  test("has no runtime or peer dependency", () => {
    expect(pkg.dependencies).toBeUndefined();
    expect(pkg.peerDependencies).toBeUndefined();
    expect(pkg.peerDependenciesMeta).toBeUndefined();
    expect(Object.keys(pkg.devDependencies).filter((name) => /react/.test(name))).toEqual([]);
  });

  test("describes itself as a stylesheet", () => {
    expect(pkg.description).toBe("Automatic skeleton loaders for any stack. One stylesheet.");
  });
});
