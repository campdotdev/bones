import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";

import { busy } from "../src/apply.ts";

function region(): HTMLElement {
  const article = document.createElement("article");
  article.innerHTML = `
    <img id="avatar" width="72" height="72" alt="" />
    <h2 id="name"></h2>
    <p id="bio" data-bones-lines="2"></p>
  `;
  return article;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("busy", () => {
  test("waits `delay` before marking the region busy and inert", () => {
    const article = region();
    busy(article, { delay: 200 });
    expect(article.hasAttribute("aria-busy")).toBe(false);
    vi.advanceTimersByTime(200);
    expect(article.getAttribute("aria-busy")).toBe("true");
    expect(article.hasAttribute("inert")).toBe(true);
    expect(article.querySelector("p")?.getAttribute("data-bones-lines")).toBe("2");
  });

  test("a response inside `delay` never shows bones", () => {
    const article = region();
    const done = busy(article, { delay: 200 });
    vi.advanceTimersByTime(100);
    done();
    vi.runAllTimers();
    expect(article.hasAttribute("aria-busy")).toBe(false);
    expect(article.hasAttribute("inert")).toBe(false);
  });

  test("keeps bones for at least `minDuration` once shown", () => {
    const article = region();
    const done = busy(article, { delay: 0, minDuration: 400 });
    vi.advanceTimersByTime(0);
    expect(article.getAttribute("aria-busy")).toBe("true");
    vi.advanceTimersByTime(100);
    done();
    vi.advanceTimersByTime(299);
    expect(article.getAttribute("aria-busy")).toBe("true");
    vi.advanceTimersByTime(1);
    expect(article.hasAttribute("aria-busy")).toBe(false);
    expect(article.hasAttribute("inert")).toBe(false);
  });

  test("hides at once when minDuration has already elapsed", () => {
    const article = region();
    const done = busy(article, { delay: 0, minDuration: 400 });
    vi.advanceTimersByTime(1000);
    done();
    vi.advanceTimersByTime(0);
    expect(article.hasAttribute("aria-busy")).toBe(false);
  });
});
