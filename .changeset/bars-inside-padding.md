---
"@camp.dev/bones": patch
---

A bar now sits inside its element's padding, with rounded ends at the content edge, so a padded badge or pill keeps its shape while it loads. Padding in `px`, `em`, or `rem` is exact. Percentage padding misses. A page reset that zeroes padding on `::after` does not move the bar.

The 85%, 100%, 92%, and 60% width variance is now a cap, not a width. A block leaf still takes its share of the container. An inline-block or flex-item leaf keeps its content width instead of stretching to a share of the row.
