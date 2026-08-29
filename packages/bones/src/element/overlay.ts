// ---------------------------------------------------------------------------
// MeasuredOverlay — draws measured bones into a shadow root
//
// The boundary owns *when* (its state machine); this class owns *what*: the
// shadow root, the bars, the two host marker attributes, and the
// ResizeObserver that re-measures. The shadow root gives the bars a home that
// page CSS, React reconciliation, and author selectors can never reach, while
// a single <slot> keeps the children in the light DOM where document
// stylesheets (the inferred rules in bones.css included) still style them.
// ---------------------------------------------------------------------------

import { measureBones } from "./measure.ts";

const OVERLAY_CSS = `
:host([precision="measured"]) {
  display: block;
  position: relative;
}
/* Hidden content still lays out, so re-measurement stays valid. Deliberately
   not !important: outer-tree rules beat ::slotted, which is what lets the
   auto opt-out rule in bones.css re-show exempt subtrees (and lets an author
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
  background: var(--bone-base, color-mix(in srgb, rgb(from currentcolor r g b / 1) 12%, transparent));
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
[part~="overlay"]:not([data-bones-animate]) [part~="bone"],
[part~="overlay"][data-bones-animate="shimmer"] [part~="bone"] {
  animation: bone-shimmer var(--bone-duration, 1.5s) ease-in-out infinite;
  background: linear-gradient(
    90deg,
    var(--bone-base, color-mix(in srgb, rgb(from currentcolor r g b / 1) 12%, transparent)) 25%,
    var(--bone-highlight, color-mix(in srgb, rgb(from currentcolor r g b / 1) 6%, transparent)) 50%,
    var(--bone-base, color-mix(in srgb, rgb(from currentcolor r g b / 1) 12%, transparent)) 75%
  );
  background-size: 200% 100%;
}
[part~="overlay"][data-bones-animate="pulse"] [part~="bone"] {
  animation: bone-pulse var(--bone-duration, 1.5s) ease-in-out infinite;
}
[part~="overlay"][data-bones-animate="none"] [part~="bone"] {
  animation: none;
}
/* Matches the shimmer/pulse selectors above at equal (0,3,0) specificity so
   this override always wins the cascade instead of losing to source order.
   data-bones-animate="none" is deliberately excluded: none still means none. */
@media (prefers-reduced-motion: reduce) {
  [part~="overlay"]:not([data-bones-animate]) [part~="bone"],
  [part~="overlay"][data-bones-animate="shimmer"] [part~="bone"],
  [part~="overlay"][data-bones-animate="pulse"] [part~="bone"] {
    animation: bone-pulse 2s ease-in-out infinite;
    background: var(--bone-base, color-mix(in srgb, rgb(from currentcolor r g b / 1) 12%, transparent));
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
  #mutations: MutationObserver | undefined;
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
    // A boundary is not expected to carry an author shadow root, so any
    // existing shadow root is assumed to be ours already. If an author did
    // attach one, this leaves it alone rather than attaching a second —
    // measured mode will not render bars into it correctly.
    if (this.#host.shadowRoot) return;
    const root = this.#host.attachShadow({ mode: "open" });
    root.append(this.#host.ownerDocument.createElement("slot"));
    applyStyles(root);
  }

  activate(): void {
    this.prepare();
    // The markers land before measuring: the auto leaf rules (min-width,
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
    if (typeof ResizeObserver !== "undefined" && !this.#observer) {
      this.#observer = new ResizeObserver(() => this.#invalidate());
      this.#observer.observe(this.#host);
    }
    // Streamed swaps replace children mid-show without resizing the host, so
    // size alone is not enough to invalidate. This observer sees only the
    // light tree — bar rendering happens in the shadow root, which a
    // light-tree observer never reports — so re-rendering bars cannot
    // re-trigger it. Attribute mutations are deliberately excluded: observing
    // them would fire on every class or style tick of anything inside the
    // boundary, and an attribute-driven reflow inside a fixed-size host is a
    // documented stale case instead.
    if (typeof MutationObserver !== "undefined" && !this.#mutations) {
      this.#mutations = new MutationObserver(() => this.#invalidate());
      this.#mutations.observe(this.#host, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }

  #unobserve(): void {
    this.#observer?.disconnect();
    this.#observer = undefined;
    this.#mutations?.disconnect();
    this.#mutations = undefined;
  }

  // Called after layout (ResizeObserver) or as a microtask after a DOM change
  // (MutationObserver); re-measuring forces layout in the second case, which
  // is fine for how rarely busy content mutates. Content that becomes
  // unmeasurable while active (e.g. the subtree emptied out) falls back to
  // the CSS path rather than leaving stale bars pinned in place.
  #invalidate(): void {
    if (this.#active && !this.#renderBars()) this.deactivate();
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
    const animate = this.#host.closest("[data-bones-animate]")?.getAttribute("data-bones-animate");
    if (animate) this.#container.setAttribute("data-bones-animate", animate);
    else this.#container.removeAttribute("data-bones-animate");
    // Measured rects are post-transform viewport geometry, but the bars'
    // CSS values are laid out in the host's local space and then transformed
    // again — under a scale(2) ancestor a naive subtraction doubles every
    // offset and size. Divide by the container's scale factors (transformed
    // bounding size over untransformed layout size) to land back in local
    // space. Rotation and skew are not compensated.
    const origin = this.#container.getBoundingClientRect();
    const style = getComputedStyle(this.#container);
    const layoutWidth = Number.parseFloat(style.width);
    const layoutHeight = Number.parseFloat(style.height);
    const scaleX = layoutWidth > 0 ? origin.width / layoutWidth : 1;
    const scaleY = layoutHeight > 0 ? origin.height / layoutHeight : 1;
    this.#container.replaceChildren(
      ...bones.map((bone) => {
        const bar = doc.createElement("div");
        bar.setAttribute("part", `bone bone-${bone.kind}`);
        bar.style.left = `${(bone.left - origin.left) / scaleX}px`;
        bar.style.top = `${(bone.top - origin.top) / scaleY}px`;
        bar.style.width = `${bone.width / scaleX}px`;
        bar.style.height = `${bone.height / scaleY}px`;
        return bar;
      }),
    );
    return true;
  }
}
