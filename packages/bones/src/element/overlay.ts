// ---------------------------------------------------------------------------
// MeasuredOverlay — draws measured bones into a shadow root
//
// The boundary owns *when* (its state machine); this class owns *what*: the
// shadow root, the bars, the two host marker attributes, and the
// ResizeObserver that re-measures. The shadow root gives the bars a home that
// page CSS, React reconciliation, and author selectors can never reach, while
// a single <slot> keeps the children in the light DOM where document
// stylesheets (auto.css included) still style them.
// ---------------------------------------------------------------------------

import { measureBones } from "./measure.ts";

const OVERLAY_CSS = `
:host([precision="measured"]) {
  display: block;
  position: relative;
}
/* Hidden content still lays out, so re-measurement stays valid. Deliberately
   not !important: outer-tree rules beat ::slotted, which is what lets the
   auto.css opt-out rule re-show exempt subtrees (and lets an author
   visibility rule on a direct child win — a documented edge). */
:host([data-bones-measured]) ::slotted(*) {
  visibility: hidden;
}
[part~="overlay"] {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
[part~="bone"] {
  position: absolute;
  background: var(--bone-base, rgba(0, 0, 0, 0.12));
  border-radius: var(--bone-radius, 4px);
}
@keyframes bone-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes bone-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
[part~="overlay"]:not([data-bone-animate]) [part~="bone"],
[part~="overlay"][data-bone-animate="shimmer"] [part~="bone"] {
  animation: bone-shimmer var(--bone-duration, 1.5s) ease-in-out infinite;
  background: linear-gradient(
    90deg,
    var(--bone-base, rgba(0, 0, 0, 0.12)) 25%,
    var(--bone-highlight, rgba(0, 0, 0, 0.06)) 50%,
    var(--bone-base, rgba(0, 0, 0, 0.12)) 75%
  );
  background-size: 200% 100%;
}
[part~="overlay"][data-bone-animate="pulse"] [part~="bone"] {
  animation: bone-pulse var(--bone-duration, 1.5s) ease-in-out infinite;
}
[part~="overlay"][data-bone-animate="none"] [part~="bone"] {
  animation: none;
}
@media (prefers-reduced-motion: reduce) {
  [part~="overlay"] [part~="bone"] {
    animation: bone-pulse 2s ease-in-out infinite;
    background: var(--bone-base, rgba(0, 0, 0, 0.12));
    background-size: auto;
  }
}
`;

let sharedSheet: CSSStyleSheet | undefined;

function applyStyles(root: ShadowRoot): void {
  if (
    "adoptedStyleSheets" in root &&
    typeof CSSStyleSheet !== "undefined" &&
    "replaceSync" in CSSStyleSheet.prototype
  ) {
    if (sharedSheet === undefined) {
      sharedSheet = new CSSStyleSheet();
      sharedSheet.replaceSync(OVERLAY_CSS);
    }
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sharedSheet];
    return;
  }
  const style = root.ownerDocument.createElement("style");
  style.textContent = OVERLAY_CSS;
  root.append(style);
}

export class MeasuredOverlay {
  #host: HTMLElement;
  #container: HTMLElement | undefined;
  #observer: ResizeObserver | undefined;
  #active = false;
  // The author may set data-bones-auto themselves; only remove it on
  // deactivate when this overlay put it there.
  #ownsAutoOff = false;

  constructor(host: HTMLElement) {
    this.#host = host;
  }

  get active(): boolean {
    return this.#active;
  }

  // Attach the shadow root once, when precision becomes "measured" — at
  // upgrade time in the common case, so the :host display change settles
  // long before a show measures anything.
  prepare(): void {
    if (this.#host.shadowRoot) return;
    const root = this.#host.attachShadow({ mode: "open" });
    root.append(this.#host.ownerDocument.createElement("slot"));
    applyStyles(root);
  }

  activate(): void {
    this.prepare();
    // The markers land before measuring: auto.css's leaf rules (min-width,
    // min-height) key on their absence, and measuring while they are still
    // active would inflate the geometry against a layout that snaps back a
    // frame later. The ::slotted visibility rule this turns on does not
    // affect layout, so measuring hidden content stays valid.
    if (!this.#active) {
      this.#active = true;
      if (!this.#host.hasAttribute("data-bones-auto")) {
        this.#host.setAttribute("data-bones-auto", "off");
        this.#ownsAutoOff = true;
      }
      this.#host.setAttribute("data-bones-measured", "");
    }
    if (!this.#renderBars()) {
      // Nothing measurable (empty subtree, no layout engine): roll the
      // markers back and stay on the CSS path for this showing window.
      this.deactivate();
      return;
    }
    this.#observe();
  }

  deactivate(): void {
    this.#unobserve();
    this.#container?.remove();
    this.#container = undefined;
    if (!this.#active) return;
    this.#active = false;
    this.#host.removeAttribute("data-bones-measured");
    if (this.#ownsAutoOff) {
      this.#host.removeAttribute("data-bones-auto");
      this.#ownsAutoOff = false;
    }
  }

  // Disconnect stops the observer but keeps the bars: a showing element that
  // moves keeps its skeleton, and the boundary re-activates on reconnect.
  pause(): void {
    this.#unobserve();
  }

  #observe(): void {
    if (typeof ResizeObserver === "undefined" || this.#observer) return;
    this.#observer = new ResizeObserver(() => {
      // The callback runs after layout, so re-measuring here is sound. The
      // bars are absolutely positioned in the shadow tree and never change
      // the host's size, so this cannot loop. Content that becomes
      // unmeasurable while active (e.g. the subtree emptied out) falls back
      // to the CSS path rather than leaving stale bars pinned in place.
      if (this.#active && !this.#renderBars()) this.deactivate();
    });
    this.#observer.observe(this.#host);
  }

  #unobserve(): void {
    this.#observer?.disconnect();
    this.#observer = undefined;
  }

  #renderBars(): boolean {
    const root = this.#host.shadowRoot;
    if (!root) return false;
    const bones = measureBones(this.#host);
    if (bones.length === 0) return false;
    const doc = this.#host.ownerDocument;
    if (!this.#container) {
      this.#container = doc.createElement("div");
      this.#container.setAttribute("part", "overlay");
      this.#container.setAttribute("aria-hidden", "true");
      root.append(this.#container);
    }
    // The overlay cannot see light-DOM ancestors from CSS, so the animation
    // override attribute is mirrored onto the container at render time.
    const animate = this.#host.closest("[data-bone-animate]")?.getAttribute("data-bone-animate");
    if (animate) this.#container.setAttribute("data-bone-animate", animate);
    else this.#container.removeAttribute("data-bone-animate");
    const origin = this.#container.getBoundingClientRect();
    this.#container.replaceChildren(
      ...bones.map((bone) => {
        const bar = doc.createElement("div");
        bar.setAttribute("part", `bone bone-${bone.kind}`);
        bar.style.left = `${bone.left - origin.left}px`;
        bar.style.top = `${bone.top - origin.top}px`;
        bar.style.width = `${bone.width}px`;
        bar.style.height = `${bone.height}px`;
        return bar;
      }),
    );
    return true;
  }
}
