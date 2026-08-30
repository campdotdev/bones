---
"@camp.dev/bones": patch
---

`data-bones-lines` and `data-bones-length` now set their value inside a busy region only. Both attributes set an inherited custom property, so an attribute on an element outside a busy region reached the leaves of a busy region nested below it and sized their bars.
