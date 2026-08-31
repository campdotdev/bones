/**
 * Builds the skeletonize-any-site bookmarklet: a javascript: URL that toggles
 * bones on the current page. First click injects the stylesheet and sets
 * aria-busy="true" on <body>; second click removes both.
 */
export function bookmarkletHref(css: string): string {
  const source = `(() => {
  const existing = document.getElementById("bones-bookmarklet");
  if (existing) {
    existing.remove();
    document.body.removeAttribute("aria-busy");
    return;
  }
  const style = document.createElement("style");
  style.id = "bones-bookmarklet";
  style.textContent = ${JSON.stringify(css)};
  document.head.append(style);
  document.body.setAttribute("aria-busy", "true");
})();`;
  return `javascript:${encodeURIComponent(source)}`;
}
