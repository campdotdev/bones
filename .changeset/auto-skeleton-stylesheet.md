---
"@camp.dev/bones": minor
---

Add `@camp.dev/bones/auto.css`, an optional stylesheet that skeletonizes unmarked leaf elements under `[aria-busy="true"]`. Leaves render as typography-native text bones with deterministic width variance; images, media, and form controls fill their own box. `[data-bones-auto="off"]` exempts a subtree, explicit `data-bone` markup stays with `bones.css`, and reduced-motion and forced-colors modes are handled.
