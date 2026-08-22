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
