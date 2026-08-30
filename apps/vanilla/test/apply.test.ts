import { describe, expect, test } from "vite-plus/test";

import { setLoading } from "../src/apply.ts";

function region(): HTMLElement {
  const article = document.createElement("article");
  article.innerHTML = `
    <img id="avatar" width="72" height="72" alt="" />
    <h2 id="name"></h2>
    <p id="bio" data-bones-lines="2"></p>
  `;
  return article;
}

describe("setLoading", () => {
  test("sets aria-busy on the region and leaves the markup alone", () => {
    const article = region();
    setLoading(article, true);
    expect(article.getAttribute("aria-busy")).toBe("true");
    expect(article.querySelector("p")?.getAttribute("data-bones-lines")).toBe("2");
    expect(article.querySelector("img")?.hasAttribute("src")).toBe(false);
  });

  test("removes aria-busy when loading ends", () => {
    const article = region();
    setLoading(article, true);
    setLoading(article, false);
    expect(article.hasAttribute("aria-busy")).toBe(false);
  });
});
