---
"@camp.dev/bones": patch
---

`BonesForce` and the `<Bones>` fallback now force skeletons in every render environment, and their boundaries nest. The loading flag lived in `React.cache()`, which memoizes per request only inside React Server Components — in client renders and non-RSC server rendering every read got a fresh object, so the flag was never shared and forcing silently did nothing. The context now detects the passthrough and falls back to a shared module context. The brackets also track a depth instead of a boolean, so a nested boundary's end restores the outer boundary's level instead of turning skeletons off for its later siblings.
