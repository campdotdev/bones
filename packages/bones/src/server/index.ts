// ---------------------------------------------------------------------------
// @camp.dev/bones/server — the wire protocol, as functions
//
// Runs anywhere with Web Streams: no DOM, no Node APIs, no imports from the
// element or React entries. streamBones is built from the exported
// primitives, so the high-level path and the documented protocol cannot
// drift. Ids are validated instead of escaped: [A-Za-z0-9_-]+ needs no
// escaping in an attribute value or a JS string literal.
// ---------------------------------------------------------------------------

import { BOOTSTRAP_SCRIPT } from "./bootstrap.ts";

export { BOOTSTRAP_SCRIPT };

const ID_PATTERN = /^[A-Za-z0-9_-]+$/;

function assertId(id: string): void {
  if (!ID_PATTERN.test(id)) {
    throw new Error(`bones slot id ${JSON.stringify(id)} must match [A-Za-z0-9_-]+`);
  }
}

export function renderBoundary(id: string, fallbackHtml: string, attrs?: string): string {
  assertId(id);
  const extra = attrs === undefined || attrs === "" ? "" : ` ${attrs}`;
  return `<bones-boundary busy aria-busy="true" inert data-bones-slot="${id}"${extra}>${fallbackHtml}</bones-boundary>`;
}

export function renderChunk(id: string, html: string): string {
  assertId(id);
  return `<template data-bones-chunk="${id}">${html}</template><script>__bonesSwap("${id}")</script>`;
}

export function renderErrorChunk(id: string, html?: string): string {
  assertId(id);
  if (html === undefined) return `<script>__bonesSwap("${id}",1)</script>`;
  return `<template data-bones-chunk="${id}">${html}</template><script>__bonesSwap("${id}",1)</script>`;
}

export interface StreamBonesOptions {
  /**
   * Renders the error HTML for a rejected slot. Returning undefined (and
   * throwing) falls back to the bare error chunk, which keeps the boundary's
   * fallback children.
   */
  onError?: (id: string, error: unknown) => string | undefined;
}

export function streamBones(
  shell: string,
  slots: Record<string, Promise<string>>,
  options: StreamBonesOptions = {},
): ReadableStream<Uint8Array> {
  const ids = Object.keys(slots);
  for (const id of ids) assertId(id);
  const encoder = new TextEncoder();
  let cancelled = false;
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (html: string): void => {
        if (!cancelled) controller.enqueue(encoder.encode(html));
      };
      send(shell + BOOTSTRAP_SCRIPT);
      if (ids.length === 0) {
        controller.close();
        return;
      }
      let pending = ids.length;
      const settle = (chunk: string): void => {
        send(chunk);
        pending -= 1;
        if (pending === 0 && !cancelled) controller.close();
      };
      for (const id of ids) {
        slots[id].then(
          (html) => settle(renderChunk(id, html)),
          (error) => {
            let html: string | undefined;
            try {
              html = options.onError?.(id, error);
            } catch {
              html = undefined;
            }
            settle(renderErrorChunk(id, html));
          },
        );
      }
    },
    cancel() {
      cancelled = true;
    },
  });
}
