---
"@camp.dev/bones": minor
---

The stylesheet is now the whole API. Under any `aria-busy="true"` element, `@camp.dev/bones/css` draws a bar for every leaf and a box for every image and control. Adjust an element with `data-bones-type="text"` or `"block"`, give a paragraph `data-bones-lines="3"`, exempt a subtree with `data-bones-auto="off"`, and pick an animation with `data-bones-animate`. All attributes are inert until the region is busy.

Removed: `createBones`, `forceBones`, `readPromise`, `minMax`, `isMinMax`, `resolveLength`, `boneAttributes`, `TRANSPARENT_PIXEL`, the React `BonesBoundary` wrapper, the `@camp.dev/bones/react` and `@camp.dev/bones/element` entries, and the React peer dependency. `data-bone`, `data-bone-line`, `data-bone-animate`, `--bone-length`, and `--bone-contained` are gone.

Migration. Replace a Suspense fallback of `<Card data={forceBones} />` with `<Card aria-busy="true" />` and have `Card` forward rest props to its root; render the shell when `data` is undefined. Replace `repeat(items, n, render)` with `(items ?? Array.from({ length: n })).map(render)`. Replace `lines(text, 3, ...)` with `data-bones-lines="3"` on the paragraph. Replace `data-bone="text"` with `data-bones-type="text"`, `data-bone="block"` and `data-bone="container"` with `data-bones-type="block"`, and `data-bone-animate` with `data-bones-animate`. Give `--bone-radius` a unit if you override it.
