import { expect, test } from "vite-plus/test";
import { app } from "../src/app.ts";

// app.request() collects the full streamed body; order within it still
// proves the wire shape: shell, one bootstrap, then chunks.

test("streams the shell, one bootstrap, then all three chunks", async () => {
  const res = await app.request("/?speed=0");
  expect(res.headers.get("content-type")).toContain("text/html");
  const body = await res.text();
  expect(body.match(/function __bonesSwap/g)).toHaveLength(1);
  const bootstrapAt = body.indexOf("function __bonesSwap");
  for (const region of ["profile", "stats", "feed"]) {
    expect(body).toContain(`data-bones-slot="${region}"`);
    const chunkAt = body.indexOf(`<template data-bones-chunk="${region}">`);
    expect(chunkAt).toBeGreaterThan(bootstrapAt);
    expect(body).toContain(`__bonesSwap("${region}")`);
  }
  expect(body).toContain('precision="measured"');
  expect(body).not.toContain("</body>");
});

test("?fail=stats flushes an error chunk with rendered content", async () => {
  const body = await (await app.request("/?speed=0&fail=stats")).text();
  expect(body).toContain('__bonesSwap("stats",1)');
  expect(body).toContain("stats failed");
  expect(body).toContain('__bonesSwap("profile")');
});

test("serves the element module from the workspace build", async () => {
  const res = await app.request("/assets/dist/element/index.mjs");
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toContain("text/javascript");
});

test("serves the stylesheets", async () => {
  expect((await app.request("/assets/src/css/auto.css")).status).toBe(200);
  expect((await app.request("/assets/src/css/bones.css")).status).toBe(200);
});

test("refuses paths outside the two published subtrees", async () => {
  expect((await app.request("/assets/package.json")).status).toBe(404);
  // WHATWG URL normalization collapses this to /assets/package.json before Hono ever sees it, so
  // this 404 comes from the prefix allowlist, not the `rel.includes("..")` guard in app.ts — that
  // guard is only reachable via raw HTTP requests that skip normalization (e.g. `curl --path-as-is`).
  expect((await app.request("/assets/src/css/../../package.json")).status).toBe(404);
  expect((await app.request("/assets/dist/index.mjs")).status).toBe(404);
});
