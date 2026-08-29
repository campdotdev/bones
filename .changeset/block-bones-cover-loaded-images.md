---
"@camp.dev/bones": patch
---

Block bones now cover an image that has already loaded. A loaded opaque image paints over its own background, so an `<img>` with a resolved `src` inside a busy region, or one marked `data-bone="block"`, showed the picture instead of a bone. Both stylesheets now push the picture out of its content box with `object-position`, which keeps the box and its bone background in place. This covers `img`, `video`, and `canvas`; a loaded `iframe`, `embed`, or `object` still shows its content, since those elements ignore `object-position`.
