---
"@camp.dev/bones": minor
---

Marked bones (`data-bone`) now shimmer by default, matching auto bones and the measured overlay. Before this, `bones.css` only animated inside a `data-bone-animate` scope, so a page that mixed an `aria-busy` region with explicit `data-bone` markup showed shimmering auto bones beside frozen marked ones. Set `data-bone-animate="none"` on a bone, a wrapper, or `<body>` to keep skeletons still. `"pulse"` still switches the animation. Under `prefers-reduced-motion: reduce`, the default and the `shimmer` and `pulse` scopes all downgrade to a slow pulse, and `none` stays still. This replaces the old reduced-motion rule, which pulsed the whole `aria-busy` element on top of the bar's own animation.
