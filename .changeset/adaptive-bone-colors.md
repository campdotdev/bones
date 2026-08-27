---
"@camp.dev/bones": minor
---

Bone colors derive from the inherited text color instead of the OS color scheme. `--bone-base` defaults to the text color at 12% opacity and `--bone-highlight` at 6%, and the `prefers-color-scheme` media query is gone. Bones are now visible on any background the surrounding text is readable on. Before this, a dark-mode OS over a page that kept a light canvas painted white bones on white (BON-13). Overriding the custom properties works unchanged. Internally, bones hide their content by zeroing the alpha of `color` so the channels survive into the derivation, and the measured overlay's no-stylesheet fallbacks derive the same way. The stylesheets now use relative color syntax, which is Baseline 2024 (Chrome 119, Safari 18, Firefox 128).
