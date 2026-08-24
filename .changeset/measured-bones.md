---
"@camp.dev/bones": minor
---

Add `precision="measured"` to `<bones-boundary>`: the element measures its rendered content with `Range.getClientRects()` and draws pixel-accurate per-line overlay bones in a shadow root, re-measuring on resize and falling back to the `auto.css` path when there is nothing to measure. The React wrapper gains a matching `precision` prop, and `auto.css` keeps `[data-bones-auto="off"]` subtrees visible under the overlay.
