import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { BonesBoundary } from "../src/element/index.ts";

// ---------------------------------------------------------------------------
// <bones-boundary> state machine
//
// The element sets aria-busy and inert as output; busy and force are input.
// Fake timers drive delay and min-duration, and Date.now() is faked with them,
// so shownAt math is deterministic.
// ---------------------------------------------------------------------------

function mount(attrs: Record<string, string> = {}): BonesBoundary {
  const el = document.createElement("bones-boundary");
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  el.innerHTML = "<p>copy</p>";
  document.body.append(el);
  return el;
}

function events(el: HTMLElement): string[] {
  const log: string[] = [];
  el.addEventListener("bones:show", () => log.push("show"));
  el.addEventListener("bones:hide", () => log.push("hide"));
  return log;
}

function shown(el: HTMLElement): boolean {
  return el.getAttribute("aria-busy") === "true" && el.hasAttribute("inert");
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("registration and reflection", () => {
  test("importing the module registers bones-boundary", () => {
    expect(customElements.get("bones-boundary")).toBe(BonesBoundary);
    expect(mount()).toBeInstanceOf(BonesBoundary);
  });

  test("boolean properties reflect to attributes", () => {
    const el = mount();
    el.busy = true;
    expect(el.hasAttribute("busy")).toBe(true);
    el.busy = false;
    expect(el.hasAttribute("busy")).toBe(false);
    el.force = true;
    expect(el.hasAttribute("force")).toBe(true);
    el.force = false;
    expect(el.hasAttribute("force")).toBe(false);
    // React 19 assigns null when a prop is removed.
    el.busy = null as unknown as boolean;
    expect(el.hasAttribute("busy")).toBe(false);
  });

  test("numeric properties parse attributes and fall back to defaults", () => {
    const el = mount();
    expect(el.delay).toBe(200);
    expect(el.minDuration).toBe(400);
    el.setAttribute("delay", "50");
    expect(el.delay).toBe(50);
    el.minDuration = 10;
    expect(el.getAttribute("min-duration")).toBe("10");
    expect(el.minDuration).toBe(10);
    for (const bad of ["abc", "-1", "Infinity", ""]) {
      el.setAttribute("delay", bad);
      expect(el.delay).toBe(200);
    }
    el.delay = null as unknown as number;
    expect(el.hasAttribute("delay")).toBe(false);
    expect(el.delay).toBe(200);
  });

  test("a property assigned before upgrade is replayed through the setter", () => {
    const el = document.createElement("bones-boundary");
    // What `boundary.busy = true` leaves behind when the page runs it before
    // the element module loads: an own data property that shadows the
    // prototype accessor for good once the element upgrades.
    Object.defineProperty(el, "busy", {
      value: true,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    document.body.append(el);
    expect(Object.prototype.hasOwnProperty.call(el, "busy")).toBe(false);
    expect(el.hasAttribute("busy")).toBe(true);
    expect(el.busy).toBe(true);
    vi.advanceTimersByTime(200);
    expect(shown(el)).toBe(true);
  });

  test("transition reads auto unless the attribute is none", () => {
    const el = mount();
    expect(el.transition).toBe("auto");
    el.setAttribute("transition", "anything");
    expect(el.transition).toBe("auto");
    el.transition = "none";
    expect(el.getAttribute("transition")).toBe("none");
    el.transition = "auto";
    expect(el.hasAttribute("transition")).toBe(false);
  });
});

describe("delay", () => {
  test("busy shows bones after the delay with aria-busy, inert, and one bones:show", () => {
    const el = mount();
    const log = events(el);
    el.busy = true;
    expect(shown(el)).toBe(false);
    expect(el.showing).toBe(false);
    vi.advanceTimersByTime(199);
    expect(shown(el)).toBe(false);
    vi.advanceTimersByTime(1);
    expect(shown(el)).toBe(true);
    expect(el.showing).toBe(true);
    expect(log).toEqual(["show"]);
  });

  test("busy cleared during the delay never shows and fires nothing", () => {
    const el = mount();
    const log = events(el);
    el.busy = true;
    vi.advanceTimersByTime(100);
    el.busy = false;
    vi.advanceTimersByTime(1000);
    expect(shown(el)).toBe(false);
    expect(log).toEqual([]);
  });

  test("a busy attribute present at connect starts the delay from connect", () => {
    const el = mount({ busy: "" });
    vi.advanceTimersByTime(199);
    expect(shown(el)).toBe(false);
    vi.advanceTimersByTime(1);
    expect(shown(el)).toBe(true);
  });

  test("a custom delay attribute is honored", () => {
    const el = mount({ delay: "50" });
    el.busy = true;
    vi.advanceTimersByTime(49);
    expect(shown(el)).toBe(false);
    vi.advanceTimersByTime(1);
    expect(shown(el)).toBe(true);
  });

  test("delay=0 shows synchronously", () => {
    const el = mount({ delay: "0" });
    el.busy = true;
    expect(shown(el)).toBe(true);
  });
});

describe("min-duration", () => {
  test("bones stay until min-duration has elapsed, then bones:hide fires", () => {
    const el = mount();
    const log = events(el);
    el.busy = true;
    vi.advanceTimersByTime(200);
    expect(shown(el)).toBe(true);
    vi.advanceTimersByTime(100);
    el.busy = false;
    expect(shown(el)).toBe(true);
    expect(el.showing).toBe(true);
    vi.advanceTimersByTime(299);
    expect(shown(el)).toBe(true);
    vi.advanceTimersByTime(1);
    expect(shown(el)).toBe(false);
    expect(el.getAttribute("aria-busy")).toBeNull();
    expect(el.hasAttribute("inert")).toBe(false);
    expect(el.showing).toBe(false);
    expect(log).toEqual(["show", "hide"]);
  });

  test("clearing busy after min-duration hides at once", () => {
    const el = mount();
    const log = events(el);
    el.busy = true;
    vi.advanceTimersByTime(200 + 400);
    el.busy = false;
    expect(shown(el)).toBe(false);
    expect(log).toEqual(["show", "hide"]);
  });

  test("busy set again while draining cancels the hide without a second show", () => {
    const el = mount();
    const log = events(el);
    el.busy = true;
    vi.advanceTimersByTime(200);
    el.busy = false;
    vi.advanceTimersByTime(100);
    el.busy = true;
    vi.advanceTimersByTime(1000);
    expect(shown(el)).toBe(true);
    expect(log).toEqual(["show"]);
  });

  test("min-duration=0 hides at once", () => {
    const el = mount({ "min-duration": "0" });
    el.busy = true;
    vi.advanceTimersByTime(200);
    el.busy = false;
    expect(shown(el)).toBe(false);
  });
});

describe("force", () => {
  test("force shows at once and ignores delay", () => {
    const el = mount();
    const log = events(el);
    el.force = true;
    expect(shown(el)).toBe(true);
    expect(log).toEqual(["show"]);
  });

  test("force in markup shows at connect", () => {
    const el = mount({ force: "" });
    expect(shown(el)).toBe(true);
  });

  test("force set during the delay cancels the timer and fires one bones:show", () => {
    const el = mount();
    const log = events(el);
    el.busy = true;
    vi.advanceTimersByTime(100);
    el.force = true;
    expect(shown(el)).toBe(true);
    // The delay timer would have fired at t=200 and shown a second time.
    vi.advanceTimersByTime(1000);
    expect(shown(el)).toBe(true);
    expect(log).toEqual(["show"]);
  });

  test("force set while draining keeps bones showing", () => {
    const el = mount();
    const log = events(el);
    el.busy = true;
    vi.advanceTimersByTime(200);
    el.busy = false;
    el.force = true;
    vi.advanceTimersByTime(1000);
    expect(shown(el)).toBe(true);
    expect(log).toEqual(["show"]);
  });

  test("clearing force with busy absent hides after min-duration counted from the force", () => {
    const el = mount();
    el.force = true;
    vi.advanceTimersByTime(100);
    el.force = false;
    expect(shown(el)).toBe(true);
    vi.advanceTimersByTime(299);
    expect(shown(el)).toBe(true);
    vi.advanceTimersByTime(1);
    expect(shown(el)).toBe(false);
  });

  test("clearing force with busy set keeps showing", () => {
    const el = mount();
    el.busy = true;
    el.force = true;
    vi.advanceTimersByTime(1000);
    el.force = false;
    vi.advanceTimersByTime(1000);
    expect(shown(el)).toBe(true);
  });
});

describe("output attribute defense", () => {
  test("attributes stripped while bones show are put back", () => {
    const el = mount({ delay: "0" });
    const log = events(el);
    el.busy = true;
    el.removeAttribute("aria-busy");
    expect(el.getAttribute("aria-busy")).toBe("true");
    el.removeAttribute("inert");
    expect(shown(el)).toBe(true);
    // Draining counts as on screen too: the bones are still painted.
    el.busy = false;
    expect(el.showing).toBe(true);
    el.removeAttribute("aria-busy");
    el.removeAttribute("inert");
    expect(shown(el)).toBe(true);
    vi.advanceTimersByTime(400);
    expect(shown(el)).toBe(false);
    expect(log).toEqual(["show", "hide"]);
  });

  test("the element leaves alone attributes it did not set", () => {
    const el = mount({ delay: "0", "min-duration": "0" });
    // Idle: the author owns these attributes, so neither setting nor
    // removing them by hand pulls the element into a showing state.
    el.setAttribute("aria-busy", "true");
    el.toggleAttribute("inert", true);
    expect(el.showing).toBe(false);
    el.removeAttribute("aria-busy");
    el.removeAttribute("inert");
    expect(el.hasAttribute("aria-busy")).toBe(false);
    expect(el.hasAttribute("inert")).toBe(false);
    // And the element's own hide is not something it defends against.
    el.busy = true;
    expect(shown(el)).toBe(true);
    el.busy = false;
    expect(shown(el)).toBe(false);
    expect(el.showing).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// View transitions. jsdom has neither startViewTransition nor matchMedia, so
// each test installs what it needs and the afterEach removes it.
// ---------------------------------------------------------------------------

// Omit + intersect rather than plain intersect: this lib's DOM types already
// declare startViewTransition/matchMedia with stricter, non-optional
// signatures, so a plain intersection would merge the real property type
// with the mock's and reject the mock as unassignable.
type TransitionDoc = Omit<Document, "startViewTransition"> & {
  startViewTransition?: (update: () => void) => unknown;
};
type MediaWindow = Omit<Window, "matchMedia"> & {
  matchMedia?: (query: string) => { matches: boolean };
};

function stubTransition() {
  const fn = vi.fn((update: () => void) => {
    update();
    return {};
  });
  (document as TransitionDoc).startViewTransition = fn;
  return fn;
}

function stubReducedMotion(matches: boolean) {
  (window as MediaWindow).matchMedia = vi.fn(() => ({ matches }));
}

// A real startViewTransition runs its update callback on a later frame. This
// stub captures the callback instead of running it, so a test can act inside
// that window and then let the stale update run.
function captureTransition(): () => void {
  let captured = (): void => {};
  (document as TransitionDoc).startViewTransition = (update: () => void) => {
    captured = update;
    return {};
  };
  return () => captured();
}

describe("view transitions", () => {
  afterEach(() => {
    delete (document as TransitionDoc).startViewTransition;
    delete (window as MediaWindow).matchMedia;
  });

  test("hide runs inside startViewTransition and show does not", () => {
    const fn = stubTransition();
    const el = mount();
    const log = events(el);
    el.busy = true;
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(400);
    el.busy = false;
    expect(fn).toHaveBeenCalledTimes(1);
    expect(shown(el)).toBe(false);
    expect(log).toEqual(["show", "hide"]);
  });

  test("bones:hide fires inside the update callback", () => {
    const order: string[] = [];
    const fn = vi.fn((update: () => void) => {
      order.push("before");
      update();
      order.push("after");
      return {};
    });
    (document as TransitionDoc).startViewTransition = fn;
    const el = mount({ delay: "0", "min-duration": "0" });
    el.addEventListener("bones:hide", () => order.push("hide"));
    el.busy = true;
    el.busy = false;
    expect(order).toEqual(["before", "hide", "after"]);
  });

  test("transition=none skips startViewTransition", () => {
    const fn = stubTransition();
    const el = mount({ delay: "0", "min-duration": "0", transition: "none" });
    el.busy = true;
    el.busy = false;
    expect(fn).not.toHaveBeenCalled();
    expect(shown(el)).toBe(false);
  });

  test("reduced motion skips startViewTransition", () => {
    const fn = stubTransition();
    stubReducedMotion(true);
    const el = mount({ delay: "0", "min-duration": "0" });
    el.busy = true;
    el.busy = false;
    expect(fn).not.toHaveBeenCalled();
    expect(shown(el)).toBe(false);
  });

  test("a matchMedia that does not match still allows the transition", () => {
    const fn = stubTransition();
    stubReducedMotion(false);
    const el = mount({ delay: "0", "min-duration": "0" });
    el.busy = true;
    el.busy = false;
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("busy set again before the update runs keeps bones and fires no second show", () => {
    const run = captureTransition();
    const el = mount({ delay: "0", "min-duration": "0" });
    const log = events(el);
    el.busy = true;
    el.busy = false;
    expect(el.showing).toBe(true);
    expect(shown(el)).toBe(true);
    el.busy = true;
    run();
    expect(shown(el)).toBe(true);
    expect(el.showing).toBe(true);
    expect(log).toEqual(["show"]);
  });

  test("an element removed before the update runs fires no bones:hide", () => {
    const run = captureTransition();
    const el = mount({ delay: "0", "min-duration": "0" });
    const log = events(el);
    el.busy = true;
    el.busy = false;
    el.remove();
    run();
    expect(log).toEqual(["show"]);
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.hasAttribute("inert")).toBe(true);
  });

  test("an uninterrupted update still hides and fires bones:hide", () => {
    const run = captureTransition();
    const el = mount({ delay: "0", "min-duration": "0" });
    const log = events(el);
    el.busy = true;
    el.busy = false;
    expect(shown(el)).toBe(true);
    run();
    expect(shown(el)).toBe(false);
    expect(el.showing).toBe(false);
    expect(log).toEqual(["show", "hide"]);
  });

  test("an element moved while its hide is queued fires no second bones:show and hides once", () => {
    const updates: Array<() => void> = [];
    (document as TransitionDoc).startViewTransition = (update: () => void) => {
      updates.push(update);
      return {};
    };
    const el = mount({ delay: "0", "min-duration": "0" });
    const log = events(el);
    el.busy = true;
    el.busy = false;
    const other = document.createElement("div");
    document.body.append(other);
    other.append(el);
    expect(log).toEqual(["show"]);
    expect(el.showing).toBe(true);
    expect(updates).toHaveLength(2);
    updates[0]();
    expect(shown(el)).toBe(true);
    expect(log).toEqual(["show"]);
    updates[1]();
    expect(shown(el)).toBe(false);
    expect(log).toEqual(["show", "hide"]);
  });

  test("rejected ViewTransition promises get handlers", async () => {
    const ready = Promise.reject(new Error("AbortError"));
    const updateCallbackDone = Promise.resolve();
    const finished = Promise.reject(new Error("AbortError"));
    const spies = [ready, updateCallbackDone, finished].map((p) => vi.spyOn(p, "catch"));
    (document as TransitionDoc).startViewTransition = (update: () => void) => {
      update();
      return { ready, updateCallbackDone, finished };
    };
    const el = mount({ delay: "0", "min-duration": "0" });
    el.busy = true;
    el.busy = false;
    for (const spy of spies) expect(spy).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    expect(shown(el)).toBe(false);
  });

  test("hide completes when startViewTransition is absent", () => {
    const el = mount({ delay: "0", "min-duration": "0" });
    const log = events(el);
    el.busy = true;
    el.busy = false;
    expect(shown(el)).toBe(false);
    expect(log).toEqual(["show", "hide"]);
  });
});

describe("server-rendered state", () => {
  test("an element connected with aria-busy=true adopts showing", () => {
    const el = document.createElement("bones-boundary");
    el.setAttribute("busy", "");
    el.setAttribute("aria-busy", "true");
    el.setAttribute("inert", "");
    document.body.append(el);
    expect(el.showing).toBe(true);
    expect(shown(el)).toBe(true);
  });

  test("min-duration counts from connect for adopted state", () => {
    const el = document.createElement("bones-boundary");
    el.setAttribute("busy", "");
    el.setAttribute("aria-busy", "true");
    document.body.append(el);
    el.busy = false;
    expect(shown(el)).toBe(true);
    vi.advanceTimersByTime(399);
    expect(shown(el)).toBe(true);
    vi.advanceTimersByTime(1);
    expect(shown(el)).toBe(false);
  });

  test("aria-busy without busy or force still adopts, then hides after min-duration", () => {
    const el = document.createElement("bones-boundary");
    el.setAttribute("aria-busy", "true");
    document.body.append(el);
    expect(el.showing).toBe(true);
    vi.advanceTimersByTime(400);
    expect(shown(el)).toBe(false);
  });
});

describe("disconnect", () => {
  test("removing the element clears timers and fires nothing", () => {
    const el = mount();
    const log = events(el);
    el.busy = true;
    el.remove();
    vi.advanceTimersByTime(1000);
    expect(shown(el)).toBe(false);
    expect(log).toEqual([]);
  });

  test("removing a draining element leaves its attributes alone and fires nothing more", () => {
    const el = mount();
    const log = events(el);
    el.busy = true;
    vi.advanceTimersByTime(200);
    el.busy = false;
    el.remove();
    vi.advanceTimersByTime(1000);
    expect(log).toEqual(["show"]);
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.hasAttribute("inert")).toBe(true);
  });

  test("an element moved while pending restarts its delay", () => {
    const el = mount();
    el.busy = true;
    vi.advanceTimersByTime(100);
    const other = document.createElement("div");
    document.body.append(other);
    other.append(el);
    vi.advanceTimersByTime(199);
    expect(shown(el)).toBe(false);
    vi.advanceTimersByTime(1);
    expect(shown(el)).toBe(true);
  });

  test("a showing element that is moved keeps its bones and still hides", () => {
    const el = mount();
    const log = events(el);
    el.busy = true;
    vi.advanceTimersByTime(200); // shows at t=200, shownAt=200
    vi.advanceTimersByTime(100); // t=300, still showing (busy), 100ms since show
    const other = document.createElement("div");
    document.body.append(other);
    other.append(el);
    // The move must not re-fire bones:show or reset the min-duration clock.
    expect(shown(el)).toBe(true);
    expect(log).toEqual(["show"]);
    el.busy = false; // t=300: 300ms remain until 400ms since the original show
    vi.advanceTimersByTime(299); // t=599, still short of t=600
    expect(shown(el)).toBe(true);
    vi.advanceTimersByTime(1); // t=600 = 400ms after the ORIGINAL show at t=200
    expect(shown(el)).toBe(false);
    expect(log).toEqual(["show", "hide"]);
  });

  test("a draining element that is moved hides on its original schedule", () => {
    const el = mount();
    const log = events(el);
    el.busy = true;
    vi.advanceTimersByTime(200); // shows at t=200, shownAt=200
    el.busy = false; // draining starts at t=200, scheduled to hide at t=600
    vi.advanceTimersByTime(350); // t=550, still draining, 50ms left
    const other = document.createElement("div");
    document.body.append(other);
    other.append(el);
    vi.advanceTimersByTime(49); // t=599, still short of t=600
    expect(shown(el)).toBe(true);
    vi.advanceTimersByTime(1); // t=600 = 400ms after the original show at t=200
    expect(shown(el)).toBe(false);
    expect(log).toEqual(["show", "hide"]);
  });
});

describe("precision", () => {
  test("reflects and parses like transition", () => {
    const el = mount();
    expect(el.precision).toBe("css");
    el.precision = "measured";
    expect(el.getAttribute("precision")).toBe("measured");
    el.precision = "css";
    expect(el.hasAttribute("precision")).toBe(false);
    el.setAttribute("precision", "wat");
    expect(el.precision).toBe("css");
  });

  test("measured precision attaches a shadow root with a slot; css does not", () => {
    expect(mount().shadowRoot).toBeNull();
    const el = mount({ precision: "measured" });
    expect(el.shadowRoot).not.toBeNull();
    expect(el.shadowRoot!.querySelector("slot")).not.toBeNull();
  });

  test("in jsdom a measured show degrades to the CSS path", () => {
    // No layout engine: measureBones returns nothing, so the overlay never
    // activates, no marker attributes land, and aria-busy/inert still do.
    const el = mount({ precision: "measured", force: "" });
    expect(shown(el)).toBe(true);
    expect(el.hasAttribute("data-bones-measured")).toBe(false);
    expect(el.hasAttribute("data-bones-auto")).toBe(false);
    expect(el.shadowRoot!.querySelector('[part~="bone"]')).toBeNull();
  });

  test("an author-set data-bones-auto is never removed", () => {
    const el = mount({ precision: "measured", "data-bones-auto": "off", force: "" });
    el.force = false;
    vi.runAllTimers();
    expect(el.getAttribute("data-bones-auto")).toBe("off");
  });
});

describe("overlay reduced-motion contract", () => {
  // The shimmer/pulse selectors and the reduced-motion override live in the
  // same shadow sheet and must stay at equal specificity, or the override
  // silently loses the cascade to source order. This pins the override's
  // selector list against the selectors it needs to beat.
  const overlaySource = readFileSync(
    join(import.meta.dirname, "../src/element/overlay.ts"),
    "utf8",
  );

  function extractReducedMotionBlock(source: string): string {
    const marker = "@media (prefers-reduced-motion: reduce)";
    const start = source.indexOf(marker);
    if (start === -1) throw new Error("reduced-motion media block not found in overlay.ts");
    const openBrace = source.indexOf("{", start);
    let depth = 0;
    let end = -1;
    for (let i = openBrace; i < source.length; i++) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) throw new Error("unbalanced braces in reduced-motion media block");
    return source
      .slice(start, end + 1)
      .replace(/\s+/g, " ")
      .trim();
  }

  test("the override matches each shimmer/pulse selector at full specificity", () => {
    const block = extractReducedMotionBlock(overlaySource);
    for (const selector of [
      '[part~="overlay"]:not([data-bones-animate]) [part~="bone"]',
      '[part~="overlay"][data-bones-animate="shimmer"] [part~="bone"]',
      '[part~="overlay"][data-bones-animate="pulse"] [part~="bone"]',
    ]) {
      expect(block).toContain(selector);
    }
  });

  test("the override deliberately excludes data-bones-animate=none", () => {
    const block = extractReducedMotionBlock(overlaySource);
    expect(block).not.toContain('[data-bones-animate="none"]');
  });
});

describe("inferred rules contract", () => {
  test("a leaf inside a showing boundary matches the inferred text selector", () => {
    const css = readFileSync(join(import.meta.dirname, "../src/css/bones.css"), "utf8");
    // The inferred text rule is the first nested `&:not(:has(*))` after the
    // layer opens. Its tail (everything after `&`) is a compound selector the
    // leaf must match on its own; the busy scope is checked separately, the
    // way the stylesheet's :is() prefix does it.
    const layerStart = css.indexOf("@layer bones-auto {");
    const start = css.indexOf("&:not(:has(*))", layerStart);
    const tail = css
      .slice(start + 1, css.indexOf("{", start))
      .replace(/\s+/g, " ")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
      .trim();
    const inferred = (node: Element) => node.matches('[aria-busy="true"] *') && node.matches(tail);
    const el = mount({ delay: "0", "min-duration": "0" });
    const leaf = el.querySelector("p")!;
    expect(inferred(leaf)).toBe(false);
    el.busy = true;
    expect(inferred(leaf)).toBe(true);
    el.busy = false;
    expect(inferred(leaf)).toBe(false);
  });
});
