---
"@camp.dev/bones": patch
---

`data-bone-animate` now takes effect from the element that carries it: a marked bone can animate itself, and an `aria-busy` region can be stilled or switched from its own tag instead of a wrapper. The animation variants live in `@scope` blocks, and a scoped selector's implicit `:scope` prefix matches strict descendants only, so the attribute was a silent no-op on the scope root itself. The scoped selectors now include the root via `:is(:scope, :scope *)`.
