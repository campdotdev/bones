import { act, cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import "../src/element/index.ts";
import { BonesBoundary } from "../src/react/index.ts";

// ---------------------------------------------------------------------------
// <BonesBoundary> is a hook-free wrapper. It maps camelCase props to the
// element's attribute names so server output drives the element before
// hydration, and relies on React 19's custom-element handling for the rest.
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("server rendering", () => {
  test("maps props to attribute names", () => {
    const html = renderToString(
      <BonesBoundary busy delay={50} minDuration={600} transition="none">
        <p>copy</p>
      </BonesBoundary>,
    );
    expect(html).toContain("<bones-boundary");
    expect(html).toContain('busy=""');
    expect(html).toContain('delay="50"');
    expect(html).toContain('min-duration="600"');
    expect(html).toContain('transition="none"');
    expect(html).not.toContain("aria-busy");
    expect(html).not.toContain("inert");
    expect(html).toContain("<p>copy</p>");
  });

  test("busy=false emits no busy attribute", () => {
    const html = renderToString(<BonesBoundary busy={false}>x</BonesBoundary>);
    expect(html).not.toContain("busy");
  });

  test("force emits aria-busy and inert so the server paints bones", () => {
    const html = renderToString(<BonesBoundary force>x</BonesBoundary>);
    expect(html).toContain('force=""');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('inert=""');
  });

  test("className and data attributes pass through", () => {
    const html = renderToString(
      <BonesBoundary className="card" data-testid="b">
        x
      </BonesBoundary>,
    );
    expect(html).toContain('class="card"');
    expect(html).toContain('data-testid="b"');
  });

  test("standard HTML and ARIA props type-check and reach the element", () => {
    const html = renderToString(
      <BonesBoundary role="status" aria-label="Loading" tabIndex={-1} onClick={() => {}}>
        x
      </BonesBoundary>,
    );
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Loading"');
  });

  test("suppressHydrationWarning never reaches the markup", () => {
    const html = renderToString(<BonesBoundary busy>x</BonesBoundary>);
    expect(html.toLowerCase()).not.toContain("suppresshydrationwarning");
  });

  test("precision passes through as an attribute", () => {
    const html = renderToString(
      <BonesBoundary busy precision="measured">
        <p>copy</p>
      </BonesBoundary>,
    );
    expect(html).toContain('precision="measured"');
  });

  test("raw <bones-boundary> type-checks with the augmented intrinsic element", () => {
    const html = renderToString(
      <bones-boundary busy delay={0} min-duration={0} transition="none">
        x
      </bones-boundary>,
    );
    expect(html).toContain('min-duration="0"');
  });
});

describe("client rendering", () => {
  test("busy drives the element and onShow/onHide receive the events", () => {
    vi.useFakeTimers();
    const onShow = vi.fn();
    const onHide = vi.fn();
    const { container, rerender } = render(
      <BonesBoundary busy delay={10} minDuration={0} onShow={onShow} onHide={onHide}>
        <p>copy</p>
      </BonesBoundary>,
    );
    const el = container.querySelector("bones-boundary")!;
    expect(el.busy).toBe(true);
    expect(el.getAttribute("aria-busy")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(onShow).toHaveBeenCalledTimes(1);
    expect(onShow.mock.calls[0][0]).toBeInstanceOf(CustomEvent);
    rerender(
      <BonesBoundary busy={false} delay={10} minDuration={0} onShow={onShow} onHide={onHide}>
        <p>copy</p>
      </BonesBoundary>,
    );
    expect(el.getAttribute("aria-busy")).toBeNull();
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  test("the output attributes survive a force to busy rerender", () => {
    vi.useFakeTimers();
    const onHide = vi.fn();
    const { container, rerender } = render(
      <BonesBoundary force onHide={onHide}>
        <p>copy</p>
      </BonesBoundary>,
    );
    const el = container.querySelector("bones-boundary")!;
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.hasAttribute("inert")).toBe(true);
    // React deletes the aria-busy and inert it rendered for `force` before it
    // applies `busy`, so the element has to put them back.
    rerender(
      <BonesBoundary busy delay={0} onHide={onHide}>
        <p>copy</p>
      </BonesBoundary>,
    );
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.hasAttribute("inert")).toBe(true);
    expect(el.showing).toBe(true);
    expect(onHide).not.toHaveBeenCalled();
    rerender(
      <BonesBoundary busy={false} delay={0} onHide={onHide}>
        <p>copy</p>
      </BonesBoundary>,
    );
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(el.getAttribute("aria-busy")).toBeNull();
    expect(el.hasAttribute("inert")).toBe(false);
    expect(el.showing).toBe(false);
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  test("minDuration reaches the element as the min-duration attribute", () => {
    const { container } = render(<BonesBoundary minDuration={25}>x</BonesBoundary>);
    const el = container.querySelector("bones-boundary")!;
    expect(el.getAttribute("min-duration")).toBe("25");
    expect(el.minDuration).toBe(25);
  });
});
