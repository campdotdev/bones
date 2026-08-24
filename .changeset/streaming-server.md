---
"@camp.dev/bones": minor
---

Add `@camp.dev/bones/server`: `streamBones` streams an HTML shell with busy `<bones-boundary>` regions and flushes out-of-order `<template>` + swap-script chunks as promises settle, plus the primitives (`BOOTSTRAP_SCRIPT`, `renderBoundary`, `renderChunk`, `renderErrorChunk`) that emit each wire-protocol piece for servers in any stack.
