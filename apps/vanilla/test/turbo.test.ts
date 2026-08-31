import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";

// Pins the docs claim that bones works with Turbo out of the box: Turbo
// itself sets aria-busy="true" on a <turbo-frame> while its src loads and
// removes it when the fetch settles. If a Turbo release stops doing that,
// this fails and the integrations page needs rewording.

type Release = (response: Response) => void;

let release: Release;

// jsdom has no IntersectionObserver; Turbo's frame element constructs one
// for lazy-loading frames. Eager loading (tested here) never consults it.
class StubIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", StubIntersectionObserver);
  // jsdom has no CSS.escape; Turbo uses it to find the matching frame in a
  // response. Plain ids like "profile" need no escaping.
  vi.stubGlobal("CSS", { escape: (value: string) => value });
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve;
        }),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

test("Turbo marks a <turbo-frame> busy while its src loads, then clears it", async () => {
  await import("@hotwired/turbo");

  const frame = document.createElement("turbo-frame");
  frame.id = "profile";
  frame.innerHTML = `<h2></h2><p data-bones-lines="2"></p>`;
  document.body.append(frame);

  frame.setAttribute("src", "/profile.html");
  await vi.waitFor(() => {
    expect(frame.getAttribute("aria-busy")).toBe("true");
  });

  release(
    new Response(`<turbo-frame id="profile"><p>loaded</p></turbo-frame>`, {
      headers: { "content-type": "text/html" },
    }),
  );
  await vi.waitFor(() => {
    expect(frame.hasAttribute("aria-busy")).toBe(false);
  });
  expect(frame.textContent).toContain("loaded");
});
