import { BonesBoundary } from "./boundary.ts";

export { BonesBoundary, DEFAULT_DELAY, DEFAULT_MIN_DURATION } from "./boundary.ts";

declare global {
  interface HTMLElementTagNameMap {
    "bones-boundary": BonesBoundary;
  }
  interface HTMLElementEventMap {
    "bones:show": CustomEvent;
    "bones:hide": CustomEvent;
  }
}

// ---------------------------------------------------------------------------
// Registration on import
//
// `import "@camp.dev/bones/element"` is the whole setup. The guard keeps the
// module importable in Node (no customElements) and safe to import twice.
// A tag that is already taken means two copies of this package on the page,
// or someone else's element under the same name, and the boundaries in the
// losing copy silently do nothing. That is worth a line in the console.
// ---------------------------------------------------------------------------

if (typeof customElements !== "undefined") {
  if (customElements.get("bones-boundary")) {
    console.warn("bones-boundary is already defined; @camp.dev/bones/element did not register");
  } else {
    customElements.define("bones-boundary", BonesBoundary);
  }
}
