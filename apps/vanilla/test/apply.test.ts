import { boneAttributes, TRANSPARENT_PIXEL } from "@camp.dev/bones";
import { describe, expect, test } from "vite-plus/test";

import { applyBone, clearBone } from "../src/apply.ts";

describe("applyBone", () => {
  test("marks a text bone with its length on the element", () => {
    const heading = document.createElement("h2");

    applyBone(heading, boneAttributes("text", { length: 10 }));

    expect(heading.getAttribute("data-bone")).toBe("text");
    expect(heading.getAttribute("aria-busy")).toBe("true");
    expect(heading.style.getPropertyValue("--bone-length")).toBe("10");
  });

  test("gives a block bone the transparent placeholder src", () => {
    const img = document.createElement("img");

    applyBone(img, boneAttributes("block"));

    expect(img.getAttribute("data-bone")).toBe("block");
    expect(img.getAttribute("src")).toBe(TRANSPARENT_PIXEL);
  });
});

describe("clearBone", () => {
  test("removes the placeholder src from a block bone", () => {
    const img = document.createElement("img");
    applyBone(img, boneAttributes("block"));

    clearBone(img);

    expect(img.hasAttribute("src")).toBe(false);
  });

  test("leaves a real src alone", () => {
    const img = document.createElement("img");
    applyBone(img, boneAttributes("block"));
    img.src = "https://example.com/avatar.png";

    clearBone(img);

    expect(img.src).toBe("https://example.com/avatar.png");
  });

  test("removes everything applyBone set", () => {
    const heading = document.createElement("h2");
    applyBone(heading, boneAttributes("text", { length: 10 }));

    clearBone(heading);

    expect(heading.hasAttribute("data-bone")).toBe(false);
    expect(heading.hasAttribute("aria-busy")).toBe(false);
    expect(heading.style.getPropertyValue("--bone-length")).toBe("");
  });
});
