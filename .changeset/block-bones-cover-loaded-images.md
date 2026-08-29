---
"@camp.dev/bones": patch
---

Block bones now cover an image that has already loaded. A loaded opaque image paints over its own background, so an `<img>` with a resolved `src` inside a busy region, or one marked `data-bone="block"`, showed the picture instead of a bone. `auto.css` and `bones.css` now set `object-position` on block bones to push the picture out of its content box. The box and its bone background stay in place. Images, canvas, and video without native controls are covered. A loaded `iframe`, `embed`, or `object` still shows its content, because those elements ignore `object-position`.
