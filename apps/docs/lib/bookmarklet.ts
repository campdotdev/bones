/**
 * Builds the skeletonize-any-site bookmarklet: a javascript: URL that toggles
 * bones on the current page. First click injects the stylesheet and sets
 * aria-busy="true" on <body>; second click removes both. A pre-existing
 * aria-busy on <body> is remembered on the style tag and put back.
 */
export function bookmarkletHref(css: string): string {
  const source = `(() => {
  const existing = document.getElementById("bones-bookmarklet");
  if (existing) {
    if (existing.dataset.prevBusy === undefined) {
      document.body.removeAttribute("aria-busy");
    } else {
      document.body.setAttribute("aria-busy", existing.dataset.prevBusy);
    }
    existing.remove();
    return;
  }
  const style = document.createElement("style");
  style.id = "bones-bookmarklet";
  style.textContent = ${JSON.stringify(css)};
  const prevBusy = document.body.getAttribute("aria-busy");
  if (prevBusy !== null) {
    style.dataset.prevBusy = prevBusy;
  }
  document.head.append(style);
  document.body.setAttribute("aria-busy", "true");
})();`;
  return `javascript:${encodeURIComponent(source)}`;
}
