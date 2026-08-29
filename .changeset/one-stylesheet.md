---
"@camp.dev/bones": minor
---

`@camp.dev/bones/css` is now the only stylesheet. It styles `data-bone` markup and, under any `aria-busy="true"` region, unmarked leaves, so a page that imports it gets skeletons for content with no bone markup at all. `@camp.dev/bones/auto.css` is removed. Change that import to `@camp.dev/bones/css`, and change CDN links from `src/css/auto.css` to `src/css/bones.css`. To keep a region readable while its container skeletonizes, set `data-bones-auto="off"` on it. Set it on `<body>` to turn auto bones off for the whole page.
