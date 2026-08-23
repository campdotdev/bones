// ---------------------------------------------------------------------------
// <bones-boundary> — owns the loading state of its subtree
//
// The element draws nothing. bones.css and auto.css key on aria-busy="true",
// so the element's whole job is to set aria-busy and inert at the right time:
// after `delay` so fast loads never flash a skeleton, and for at least
// `min-duration` so slow ones never strobe. `busy` and `force` are the inputs
// an author controls; aria-busy and inert are outputs the element controls.
// ---------------------------------------------------------------------------

export const DEFAULT_DELAY = 200;
export const DEFAULT_MIN_DURATION = 400;

const UPGRADE_PROPERTIES = ["busy", "force", "delay", "minDuration", "transition"] as const;
type UpgradeProperty = (typeof UPGRADE_PROPERTIES)[number];

// "hiding" is the window a view transition leaves open: #hide has decided to
// remove the output attributes, but the browser runs the update callback on a
// later frame. Bones are still on screen, and busy or force arriving in that
// window must cancel the hide rather than race it.
type State = "idle" | "pending" | "showing" | "draining" | "hiding";

const swallow = (): void => {};

function parseMs(value: string | null, fallback: number): number {
  if (value === null || value.trim() === "") return fallback;
  const ms = Number(value);
  return Number.isFinite(ms) && ms >= 0 ? ms : fallback;
}

// `extends HTMLElement` evaluates HTMLElement when the module loads. Node has
// none, and a Next.js client module still runs on the server during SSR, so
// the base class falls back to an empty class there. Registration is skipped
// in that case anyway (see index.ts).
const Base: typeof HTMLElement =
  typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

export class BonesBoundary extends Base {
  // aria-busy and inert are outputs, observed only so the element can put
  // them back when something else strips them. See attributeChangedCallback.
  static readonly observedAttributes = ["busy", "force", "aria-busy", "inert"];

  #state: State = "idle";
  #timer: ReturnType<typeof setTimeout> | undefined;
  #connected = false;
  #shownAt = 0;
  #hideToken = 0;
  #writingOutput = false;

  get busy(): boolean {
    return this.hasAttribute("busy");
  }

  set busy(value: boolean) {
    this.toggleAttribute("busy", Boolean(value));
  }

  get force(): boolean {
    return this.hasAttribute("force");
  }

  set force(value: boolean) {
    this.toggleAttribute("force", Boolean(value));
  }

  get delay(): number {
    return parseMs(this.getAttribute("delay"), DEFAULT_DELAY);
  }

  set delay(value: number) {
    if (value === null || value === undefined) this.removeAttribute("delay");
    else this.setAttribute("delay", String(value));
  }

  get minDuration(): number {
    return parseMs(this.getAttribute("min-duration"), DEFAULT_MIN_DURATION);
  }

  set minDuration(value: number) {
    if (value === null || value === undefined) this.removeAttribute("min-duration");
    else this.setAttribute("min-duration", String(value));
  }

  get transition(): "auto" | "none" {
    return this.getAttribute("transition") === "none" ? "none" : "auto";
  }

  set transition(value: "auto" | "none") {
    if (value === "none") this.setAttribute("transition", "none");
    else this.removeAttribute("transition");
  }

  get showing(): boolean {
    return this.#state === "showing" || this.#state === "draining" || this.#state === "hiding";
  }

  connectedCallback(): void {
    for (const name of UPGRADE_PROPERTIES) this.#upgradeProperty(name);
    this.#connected = true;
    // Server-rendered markup can carry aria-busy="true" so the CSS paints
    // bones before this script runs. Adopt that as "showing" rather than
    // re-running the delay; min-duration counts from now.
    if (this.getAttribute("aria-busy") === "true" && !this.showing) {
      this.#show();
      if (!this.busy && !this.force) this.#evaluate();
      return;
    }
    this.#evaluate();
  }

  disconnectedCallback(): void {
    this.#connected = false;
    this.#clearTimer();
    // A pending element that gets reparented (moved with appendChild, busy
    // unchanged) must restart its delay rather than get stuck: without this,
    // connectedCallback's #evaluate sees busy=true and state="pending" (not
    // idle or draining) and does nothing. A showing or draining element keeps
    // its state (and its aria-busy/inert attributes) across the move: it
    // already has a live skeleton on screen and must keep its original
    // min-duration clock rather than re-fire bones:show and restart the
    // window from the reconnect time. A hiding element rolls back to showing:
    // its attributes are still on, the queued update bails because the state
    // is no longer "hiding" (a removed element fires no events), and a moved
    // element re-evaluates from its original #shownAt instead of taking the
    // adoption path and firing a second bones:show.
    if (this.#state === "pending") this.#state = "idle";
    else if (this.#state === "hiding") this.#state = "showing";
  }

  attributeChangedCallback(name: string): void {
    // Attributes parsed from markup fire this before connectedCallback; the
    // connect path evaluates once for all of them.
    if (!this.#connected) return;
    if (name === "aria-busy" || name === "inert") {
      this.#defendOutput();
      return;
    }
    this.#evaluate();
  }

  // React 19 owns every prop it renders, so a <BonesBoundary> that drops
  // `force` makes React delete the aria-busy and inert it wrote alongside it,
  // mid-update, while the element still means to show bones. Put them back.
  // Only in the two states that mean "bones are on screen and staying there":
  // #hide leaves "showing" and "draining" for "hiding" before it removes
  // anything, so the element never fights its own hide, and #writingOutput
  // keeps the reaction from its own setAttribute out of here entirely. An
  // idle element leaves both attributes alone; they are the author's then.
  #defendOutput(): void {
    if (this.#writingOutput) return;
    if (this.#state !== "showing" && this.#state !== "draining") return;
    if (this.getAttribute("aria-busy") === "true" && this.hasAttribute("inert")) return;
    this.#writeOutput(true);
  }

  // A page that assigns boundary.busy = false before this module loads writes
  // an own data property onto the element. Upgrading does not remove it, and
  // it shadows the prototype accessor from then on, so the setter never runs
  // and the element never reads the attribute again. Replay the value through
  // the accessor and delete the shadow.
  #upgradeProperty(name: UpgradeProperty): void {
    if (!Object.prototype.hasOwnProperty.call(this, name)) return;
    const self = this as unknown as Partial<Record<UpgradeProperty, unknown>>;
    const value = self[name];
    delete self[name];
    self[name] = value;
  }

  #clearTimer(): void {
    if (this.#timer !== undefined) clearTimeout(this.#timer);
    this.#timer = undefined;
  }

  #evaluate(): void {
    if (this.force) {
      if (this.#state === "draining" || this.#state === "hiding") {
        this.#resume();
      } else if (this.#state !== "showing") {
        this.#show();
      }
      return;
    }

    if (this.busy) {
      if (this.#state === "idle") {
        const delay = this.delay;
        if (delay === 0) {
          this.#show();
        } else {
          this.#state = "pending";
          this.#timer = setTimeout(() => this.#show(), delay);
        }
      } else if (this.#state === "draining" || this.#state === "hiding") {
        this.#resume();
      }
      return;
    }

    if (this.#state === "pending") {
      this.#clearTimer();
      this.#state = "idle";
    } else if (this.#state === "showing" || this.#state === "draining") {
      // A reconnected draining element (its timer was cleared by
      // disconnectedCallback) reschedules the remainder of its original
      // min-duration window rather than a fresh one. "hiding" is left out of
      // this branch on purpose: that hide is already in flight.
      this.#clearTimer();
      const remaining = this.#shownAt + this.minDuration - Date.now();
      if (remaining <= 0) {
        this.#hide();
      } else {
        this.#state = "draining";
        this.#timer = setTimeout(() => this.#hide(), remaining);
      }
    }
  }

  // Bones never left the screen, so this is not a fresh show: no bones:show,
  // and shownAt keeps its original value so min-duration still counts from
  // the first show. The output attributes are written again because whatever
  // stripped them (React, see attributeChangedCallback) can have run while
  // the state was "hiding", where the element does not defend them.
  #resume(): void {
    this.#clearTimer();
    this.#state = "showing";
    this.#writeOutput(true);
  }

  #show(): void {
    this.#clearTimer();
    this.#state = "showing";
    this.#shownAt = Date.now();
    this.#writeOutput(true);
    this.dispatchEvent(new CustomEvent("bones:show", { bubbles: true, composed: true }));
  }

  #hide(): void {
    this.#clearTimer();
    this.#state = "hiding";
    const token = ++this.#hideToken;
    const update = (): void => {
      // A real startViewTransition runs this a frame or more later. Anything
      // that happened in between (busy set again, the element removed, a
      // newer hide started) has already moved the state off "hiding" or
      // advanced the token, and this stale update must not undo it.
      if (this.#state !== "hiding" || token !== this.#hideToken) return;
      this.#state = "idle";
      this.#writeOutput(false);
      this.dispatchEvent(new CustomEvent("bones:hide", { bubbles: true, composed: true }));
    };
    if (this.#canTransition()) {
      const transition = document.startViewTransition(update) as
        | Partial<ViewTransition>
        | undefined;
      // A transition that a newer one supersedes rejects `ready` with
      // AbortError, and that is the normal case when two boundaries hide in
      // the same frame. Nothing here can act on it, so swallow the rejections
      // rather than log one per overlapping hide.
      transition?.ready?.catch(swallow);
      transition?.updateCallbackDone?.catch(swallow);
      transition?.finished?.catch(swallow);
    } else {
      update();
    }
  }

  // The element's own writes to its output attributes, flagged while they run
  // so the attributeChangedCallback that defends those attributes ignores
  // them and cannot recurse into itself.
  #writeOutput(shown: boolean): void {
    this.#writingOutput = true;
    try {
      if (shown) {
        this.setAttribute("aria-busy", "true");
        this.toggleAttribute("inert", true);
      } else {
        this.removeAttribute("aria-busy");
        this.removeAttribute("inert");
      }
    } finally {
      this.#writingOutput = false;
    }
  }

  // Showing never animates: a crossfade into a skeleton only delays the
  // loading state. Hiding animates when the page allows it.
  #canTransition(): boolean {
    if (this.transition === "none") return false;
    if (typeof document.startViewTransition !== "function") return false;
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return false;
    }
    return true;
  }
}
