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
// ---------------------------------------------------------------------------

if (typeof customElements !== "undefined" && !customElements.get("bones-boundary")) {
  customElements.define("bones-boundary", BonesBoundary);
}
