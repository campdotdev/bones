---
"@camp.dev/bones": minor
---

The package is the stylesheet alone. `@camp.dev/bones/css` is the only export, nothing ships JavaScript, and there is no build.

Removed: `<bones-boundary>` and everything on it (`busy`, `force`, `delay`, `min-duration`, `transition`, `precision="measured"`, the `bones:show` and `bones:hide` events), the `BonesBoundary`, `DEFAULT_DELAY`, and `DEFAULT_MIN_DURATION` exports, the `@camp.dev/bones` root entry, and the `@camp.dev/bones/server` streaming kit (`streamBones`, `renderBoundary`, `renderChunk`, `renderErrorChunk`, `BOOTSTRAP_SCRIPT`, `BOOTSTRAP_JS`) with its wire protocol. `bones.css` no longer carries the `bones-boundary[data-bones-measured]` rule.

Migration. A Suspense or streaming fallback needs no change; it already carries `aria-busy="true"`. Add `inert` beside it when the fallback renders links or controls. A `<bones-boundary busy>` you toggled yourself becomes any element you set `aria-busy="true"` and `inert` on; the delay, minimum duration, and crossfade are the "Delay and hold" recipe in the docs. A server that used `streamBones` keeps its shell and chunks and emits the swap script itself; the docs' Streaming page shows it, and a server that owns the script can put a CSP nonce on it, which the kit could not.
