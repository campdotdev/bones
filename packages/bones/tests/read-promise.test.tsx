import { cleanup, render, screen, act } from "@testing-library/react";
import { Suspense } from "react";
import { afterEach, describe, expect, test } from "vite-plus/test";

// readPromise is internal — import directly from source
import { readPromise } from "../src/react/create-bones.ts";

function ReadPromiseTest({ promise }: { promise: Promise<string> }) {
  const result = readPromise(promise);
  return <div data-testid="result">{result}</div>;
}

afterEach(cleanup);

function createDeferredPromise() {
  let resolve!: (value: string) => void;
  const promise = new Promise<string>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

async function renderWithSuspense(promise: Promise<string>) {
  await act(async () => {
    render(
      <Suspense fallback={<div data-testid="fallback">loading</div>}>
        <ReadPromiseTest promise={promise} />
      </Suspense>,
    );
  });
}

describe("readPromise", () => {
  test("returns resolved value after promise resolves", async () => {
    const promise = Promise.resolve("hello");

    await renderWithSuspense(promise);

    expect(screen.getByTestId("result").textContent).toBe("hello");
  });

  test("throws pending promise to trigger Suspense fallback", async () => {
    const promise = new Promise<string>(() => {});

    await renderWithSuspense(promise);

    expect(screen.getByTestId("fallback").textContent).toBe("loading");
  });

  test("transitions from fallback to content when promise resolves", async () => {
    const { promise, resolve } = createDeferredPromise();

    await renderWithSuspense(promise);

    expect(screen.getByTestId("fallback").textContent).toBe("loading");

    await act(async () => {
      resolve("hello");
    });

    expect(screen.getByTestId("result").textContent).toBe("hello");
  });

  test("throws error for rejected promise", async () => {
    const error = new Error("fail");
    const promise = Promise.reject(error);
    // Suppress unhandled rejection warning in test
    promise.catch(() => {});

    // Set up tracking before microtasks run
    try {
      readPromise(promise);
    } catch {
      // Expected: throws promise (pending state) on first call
    }

    // Wait for the rejection microtask to populate the error state
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(() => readPromise(promise)).toThrow("fail");
  });

  test("tracks promise only once", () => {
    let attachCount = 0;
    const original = Promise.resolve("value");
    // eslint-disable-next-line unicorn/no-thenable
    const tracked = Object.create(original) as Promise<string>;
    // @ts-expect-error — intentional mock promise for testing handler attachment
    // eslint-disable-next-line unicorn/no-thenable
    tracked.then = function (...args: Parameters<Promise<string>["then"]>) {
      attachCount++;
      return original.then(...args);
    };
    // @ts-expect-error — intentional mock promise for testing handler attachment
    tracked.catch = function (...args: Parameters<Promise<string>["catch"]>) {
      return original.catch(...args);
    };

    try {
      readPromise(tracked);
    } catch {
      // throws on first call (pending)
    }
    try {
      readPromise(tracked);
    } catch {
      // throws again (still pending)
    }

    expect(attachCount).toBe(1);
  });
});
