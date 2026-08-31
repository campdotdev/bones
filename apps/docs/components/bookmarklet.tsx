import { readFileSync } from "node:fs";
import { join } from "node:path";

import { bookmarkletHref } from "@/lib/bookmarklet";

// The CSS is read straight from the workspace dependency link. Bundler-based
// resolution is off the table: Turbopack turns any require of the package's
// css export, static or dynamic, into a CSS asset or an error stub, and a
// text read needs the file. If the file moves, this read throws and the docs
// build fails loudly.
const cssPath = join(
  process.cwd(),
  "node_modules",
  "@camp.dev",
  "bones",
  "src",
  "css",
  "bones.css",
);

/**
 * The skeletonize-any-site bookmarklet as a draggable link. React refuses
 * javascript: hrefs rendered through JSX, so the anchor is raw HTML. The
 * href is encodeURIComponent output: no quotes or angle brackets, so it is
 * attribute-safe. The stylesheet is read from the workspace package at
 * build time and cannot drift from the published CSS.
 */
export function Bookmarklet() {
  const css = readFileSync(cssPath, "utf8");
  const anchor = `<a href="${bookmarkletHref(css)}" title="Drag me to your bookmarks bar" style="display:inline-block;padding:0.25rem 0.75rem;border:1px solid currentColor;border-radius:0.5rem;text-decoration:none;cursor:grab">🦴 Bones</a>`;
  return <span dangerouslySetInnerHTML={{ __html: anchor }} />;
}
