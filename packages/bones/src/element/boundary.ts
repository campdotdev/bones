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

type State = "idle" | "pending" | "showing" | "draining";

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
  static readonly observedAttributes = ["busy", "force"];

  #state: State = "idle";
  #timer: ReturnType<typeof setTimeout> | undefined;
  #connected = false;

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
    return this.#state === "showing" || this.#state === "draining";
  }

  connectedCallback(): void {
    this.#connected = true;
    this.#evaluate();
  }

  disconnectedCallback(): void {
    this.#connected = false;
    this.#clearTimer();
  }

  attributeChangedCallback(): void {
    // Attributes parsed from markup fire this before connectedCallback; the
    // connect path evaluates once for all of them.
    if (this.#connected) this.#evaluate();
  }

  #clearTimer(): void {
    if (this.#timer !== undefined) clearTimeout(this.#timer);
    this.#timer = undefined;
  }

  #evaluate(): void {
    if (this.force) {
      if (this.#state === "draining") {
        this.#clearTimer();
        this.#state = "showing";
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
      } else if (this.#state === "draining") {
        this.#clearTimer();
        this.#state = "showing";
      }
      return;
    }

    if (this.#state === "pending") {
      this.#clearTimer();
      this.#state = "idle";
    }
  }

  #show(): void {
    this.#clearTimer();
    this.#state = "showing";
    this.setAttribute("aria-busy", "true");
    this.toggleAttribute("inert", true);
    this.dispatchEvent(new CustomEvent("bones:show", { bubbles: true, composed: true }));
  }
}
