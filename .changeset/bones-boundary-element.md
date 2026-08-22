---
"@camp.dev/bones": minor
---

Add `@camp.dev/bones/element`, a `<bones-boundary>` custom element that owns the loading state of its subtree. Set `busy` and the element sets `aria-busy="true"` and `inert` after a `delay` (200 ms), keeps them for at least `min-duration` (400 ms), and removes them inside a view transition where the browser supports one. It fires `bones:show` and `bones:hide`, honors `force` for demos, and adopts server-rendered `aria-busy` on upgrade. `@camp.dev/bones/react` gains a hook-free `<BonesBoundary>` wrapper.
