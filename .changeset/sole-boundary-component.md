---
"@camp.dev/bones": minor
---

The React entry no longer ships skeleton components. `<bones-boundary>` is the one skeleton component. React keeps helpers only: `createBones`, `forceBones`, `readPromise`, `minMax`, `isMinMax`, and the `BonesBoundary` wrapper.

`<Bones>` is gone. Write the Suspense boundary yourself. Pass `forceBones` where the fallback needs a pending prop:

```tsx
<Suspense fallback={<ProfileCard user={forceBones} />}>
  <ProfileCard user={fetchUser()} />
</Suspense>
```

`<BonesForce>` is gone. Pass `forceBones` as the data prop of each component you want forced, or wrap unmarked content in `<bones-boundary force>`.

The ambient loading flag went with them. `createBones` no longer reads any context. It shows bones only for the `loading` option, the `forceBones` sentinel, or a pending promise.
