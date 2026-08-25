import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { streamBones } from "@camp.dev/bones/server";
import { Hono } from "hono";
import { load, REGIONS, shell } from "./page.ts";

const require = createRequire(import.meta.url);
const bonesRoot = path.dirname(require.resolve("@camp.dev/bones/package.json"));

const TYPES: Record<string, string> = {
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

export const app = new Hono();

app.get("/", (c) => {
  const rawSpeed = Number(c.req.query("speed") ?? "1");
  const speed = Number.isFinite(rawSpeed) && rawSpeed >= 0 ? rawSpeed : 1;
  const fail = c.req.query("fail") ?? null;
  const slots = Object.fromEntries(REGIONS.map((region) => [region, load(region, speed, fail)]));
  const stream = streamBones(shell(), slots, {
    onError: (id, error) => `<p class="error">${id} failed: ${(error as Error).message}</p>`,
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      // nginx-style proxies buffer streamed responses unless told not to.
      "x-accel-buffering": "no",
    },
  });
});

// Serves the workspace package's built element module and its stylesheets,
// so the demo always runs the current build. Only these two subtrees exist.
app.get("/assets/*", async (c) => {
  const rel = c.req.path.slice("/assets/".length);
  const allowed =
    (rel.startsWith("dist/element/") || rel.startsWith("src/css/")) && !rel.includes("..");
  const type = TYPES[path.extname(rel)];
  if (!allowed || type === undefined) return c.notFound();
  try {
    const body = await readFile(path.join(bonesRoot, rel));
    return c.body(new Uint8Array(body), 200, { "content-type": type });
  } catch {
    return c.notFound();
  }
});
