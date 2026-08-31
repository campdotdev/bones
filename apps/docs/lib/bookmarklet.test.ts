import { afterEach, expect, test } from "vite-plus/test";

import { bookmarkletHref } from "./bookmarklet";

const css = `[aria-busy="true"] :not(:has(*)) { color: transparent; }`;

function click(href: string) {
  const source = decodeURIComponent(href.replace(/^javascript:/, ""));
  new Function(source)();
}

afterEach(() => {
  document.head.innerHTML = "";
  document.body.removeAttribute("aria-busy");
});

test("builds a javascript: URL", () => {
  expect(bookmarkletHref(css).startsWith("javascript:")).toBe(true);
});

test("first click injects the stylesheet and marks <body> busy", () => {
  click(bookmarkletHref(css));

  const style = document.head.querySelector("style#bones-bookmarklet");
  expect(style?.textContent).toBe(css);
  expect(document.body.getAttribute("aria-busy")).toBe("true");
});

test("second click restores a pre-existing aria-busy on <body>", () => {
  document.body.setAttribute("aria-busy", "true");

  const href = bookmarkletHref(css);
  click(href);
  click(href);

  expect(document.body.getAttribute("aria-busy")).toBe("true");
});

test("second click removes the stylesheet and the busy mark", () => {
  const href = bookmarkletHref(css);
  click(href);
  click(href);

  expect(document.head.querySelector("style#bones-bookmarklet")).toBeNull();
  expect(document.body.hasAttribute("aria-busy")).toBe(false);
});
