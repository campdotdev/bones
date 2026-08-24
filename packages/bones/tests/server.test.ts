import { describe, expect, test } from "vite-plus/test";
import {
  BOOTSTRAP_SCRIPT,
  renderBoundary,
  renderChunk,
  renderErrorChunk,
  streamBones,
} from "../src/server/index.ts";

// ---------------------------------------------------------------------------
// Stream assembly, no DOM: the wire protocol as strings and their order.
// The bootstrap's behavior in a document lives in server-bootstrap.test.ts.
// ---------------------------------------------------------------------------

async function drain(stream: ReadableStream<Uint8Array>): Promise<string[]> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return chunks;
    chunks.push(decoder.decode(value));
  }
}

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (v: T) => void;
  reject: (r: unknown) => void;
} {
  let resolve!: (v: T) => void;
  let reject!: (r: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const SHELL = "<!doctype html><html><head></head><body><h1>shell</h1>";

describe("primitives", () => {
  test("renderBoundary emits the server-busy boundary", () => {
    expect(renderBoundary("a", "<p>fallback</p>")).toBe(
      '<bones-boundary busy aria-busy="true" inert data-bones-slot="a"><p>fallback</p></bones-boundary>',
    );
  });

  test("renderBoundary appends extra attributes", () => {
    expect(renderBoundary("a", "", 'precision="measured"')).toBe(
      '<bones-boundary busy aria-busy="true" inert data-bones-slot="a" precision="measured"></bones-boundary>',
    );
  });

  test("renderChunk emits the template and the swap call together", () => {
    expect(renderChunk("a", "<p>hi</p>")).toBe(
      '<template data-bones-chunk="a"><p>hi</p></template><script>__bonesSwap("a")</script>',
    );
  });

  test("renderErrorChunk is bare without html", () => {
    expect(renderErrorChunk("a")).toBe('<script>__bonesSwap("a",1)</script>');
  });

  test("renderErrorChunk carries html when given", () => {
    expect(renderErrorChunk("a", "<p>broke</p>")).toBe(
      '<template data-bones-chunk="a"><p>broke</p></template><script>__bonesSwap("a",1)</script>',
    );
  });

  test.each(["", "a b", "a<b", 'a"b', "a/b", "a."])("id %j is rejected everywhere", (id) => {
    expect(() => renderBoundary(id, "")).toThrowError(/must match/);
    expect(() => renderChunk(id, "")).toThrowError(/must match/);
    expect(() => renderErrorChunk(id)).toThrowError(/must match/);
    expect(() => streamBones("", { [id]: Promise.resolve("") })).toThrowError(/must match/);
  });
});

describe("streamBones", () => {
  test("the first chunk is the shell plus the bootstrap, exactly once", async () => {
    const chunks = await drain(streamBones(SHELL, {}));
    expect(chunks).toEqual([SHELL + BOOTSTRAP_SCRIPT]);
  });

  test("chunks flush in settlement order and the stream closes after the last", async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const reading = drain(streamBones(SHELL, { first: first.promise, second: second.promise }));
    second.resolve("<p>2</p>");
    first.resolve("<p>1</p>");
    expect(await reading).toEqual([
      SHELL + BOOTSTRAP_SCRIPT,
      renderChunk("second", "<p>2</p>"),
      renderChunk("first", "<p>1</p>"),
    ]);
  });

  test("a rejection flushes the bare error chunk by default", async () => {
    const chunks = await drain(streamBones(SHELL, { a: Promise.reject(new Error("nope")) }));
    expect(chunks).toEqual([SHELL + BOOTSTRAP_SCRIPT, renderErrorChunk("a")]);
  });

  test("onError renders the error chunk's content", async () => {
    const chunks = await drain(
      streamBones(
        SHELL,
        { a: Promise.reject(new Error("nope")) },
        { onError: (id, error) => `<p>${id}: ${(error as Error).message}</p>` },
      ),
    );
    expect(chunks[1]).toBe(renderErrorChunk("a", "<p>a: nope</p>"));
  });

  test("onError returning undefined and onError throwing both fall back to the bare chunk", async () => {
    const silent = await drain(
      streamBones(SHELL, { a: Promise.reject(new Error("nope")) }, { onError: () => undefined }),
    );
    expect(silent[1]).toBe(renderErrorChunk("a"));
    const throwing = await drain(
      streamBones(
        SHELL,
        { a: Promise.reject(new Error("nope")) },
        {
          onError: () => {
            throw new Error("renderer broke");
          },
        },
      ),
    );
    expect(throwing[1]).toBe(renderErrorChunk("a"));
  });

  test("cancelling stops future flushes without throwing", async () => {
    const slot = deferred<string>();
    const stream = streamBones(SHELL, { a: slot.promise });
    const reader = stream.getReader();
    await reader.read(); // the shell
    await reader.cancel();
    slot.resolve("<p>late</p>");
    await slot.promise;
    await Promise.resolve(); // the settle callback runs here — it must not throw
  });
});
