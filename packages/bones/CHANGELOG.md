# bones

## 0.4.0

### Minor Changes

- [#42](https://github.com/campdotdev/bones/pull/42) [`f4d1362`](https://github.com/campdotdev/bones/commit/f4d1362e1c638ed0bc7145fbd20a46e2d1508c1a) Thanks [@hunterbecton](https://github.com/hunterbecton)! - Bone colors derive from the inherited text color instead of the OS color scheme. `--bone-base` defaults to the text color at 12% opacity and `--bone-highlight` at 6%, and the `prefers-color-scheme` media query is gone. Bones are now visible on any background the surrounding text is readable on. Before this, a dark-mode OS over a page that kept a light canvas painted white bones on white (BON-13). Overriding the custom properties works unchanged. Internally, bones hide their content by zeroing the alpha of `color` so the channels survive into the derivation, and the measured overlay's no-stylesheet fallbacks derive the same way. The stylesheets now use relative color syntax, which is Baseline 2024 (Chrome 119, Safari 18, Firefox 128).

- [#51](https://github.com/campdotdev/bones/pull/51) [`dc790c3`](https://github.com/campdotdev/bones/commit/dc790c32ea61c614085d2c7d9115b6b384637a4e) Thanks [@hunterbecton](https://github.com/hunterbecton)! - Marked bones (`data-bone`) now shimmer by default, matching auto bones and the measured overlay. Before this, `bones.css` only animated inside a `data-bone-animate` scope, so a page that mixed an `aria-busy` region with explicit `data-bone` markup showed shimmering auto bones beside frozen marked ones. Set `data-bone-animate="none"` on a bone, a wrapper, or `<body>` to keep skeletons still. `"pulse"` still switches the animation. Under `prefers-reduced-motion: reduce`, the default and the `shimmer` and `pulse` scopes all downgrade to a slow pulse, and `none` stays still. This replaces the old reduced-motion rule, which pulsed the whole `aria-busy` element on top of the bar's own animation.

- [#47](https://github.com/campdotdev/bones/pull/47) [`3a690bb`](https://github.com/campdotdev/bones/commit/3a690bb50b3f2bcf898f2218457d519a85223103) Thanks [@hunterbecton](https://github.com/hunterbecton)! - `<bones-boundary>` is now the sole skeleton component. The React entry removes `<Bones>` and `<BonesForce>` and keeps `createBones`, `forceBones`, `readPromise`, `minMax`, `isMinMax`, and the `BonesBoundary` wrapper for `<bones-boundary>`.

  `<Bones>` is gone. Write the Suspense boundary yourself. Pass `forceBones` where the fallback needs a pending prop:

  ```tsx
  <Suspense fallback={<ProfileCard user={forceBones} />}>
    <ProfileCard user={fetchUser()} />
  </Suspense>
  ```

  `<BonesForce>` is gone. Pass `forceBones` as the data prop of each component you want forced, or wrap unmarked content in `<bones-boundary force>`.

  The ambient loading flag went with them. `createBones` no longer reads any context. It shows bones only for the `loading` option, the `forceBones` sentinel, or a pending promise.

### Patch Changes

- [#45](https://github.com/campdotdev/bones/pull/45) [`14ff496`](https://github.com/campdotdev/bones/commit/14ff49692bfbb5de6c3949b6569ca0662bcd6bbb) Thanks [@hunterbecton](https://github.com/hunterbecton)! - `data-bone-animate` now takes effect from the element that carries it: a marked bone can animate itself, and an `aria-busy` region can be stilled or switched from its own tag instead of a wrapper. The animation variants live in `@scope` blocks, and a scoped selector's implicit `:scope` prefix matches strict descendants only, so the attribute was a silent no-op on the scope root itself. The scoped selectors now include the root via `:is(:scope, :scope *)`.

## 0.3.0

### Minor Changes

- [#34](https://github.com/campdotdev/bones/pull/34) [`7e4e1a0`](https://github.com/campdotdev/bones/commit/7e4e1a098be7acc0472e960bc185ecb09a390d86) Thanks [@hunterbecton](https://github.com/hunterbecton)! - Add `@camp.dev/bones/element`, a `<bones-boundary>` custom element that owns the loading state of its subtree. Set `busy` and the element sets `aria-busy="true"` and `inert` after a `delay` (200 ms), keeps them for at least `min-duration` (400 ms), and removes them inside a view transition where the browser supports one. It fires `bones:show` and `bones:hide`, honors `force` for demos, and adopts server-rendered `aria-busy` on upgrade. `@camp.dev/bones/react` gains a hook-free `<BonesBoundary>` wrapper.

- [#37](https://github.com/campdotdev/bones/pull/37) [`b7548cc`](https://github.com/campdotdev/bones/commit/b7548cc3a482c6f3ce1859c559d69cddf193a5ba) Thanks [@hunterbecton](https://github.com/hunterbecton)! - Add `precision="measured"` to `<bones-boundary>`: the element measures its rendered content with `Range.getClientRects()` and draws pixel-accurate per-line overlay bones in a shadow root, re-measuring on resize and falling back to the `auto.css` path when there is nothing to measure. The React wrapper gains a matching `precision` prop, and `auto.css` keeps `[data-bones-auto="off"]` subtrees visible under the overlay.

- [#39](https://github.com/campdotdev/bones/pull/39) [`ae5fbc6`](https://github.com/campdotdev/bones/commit/ae5fbc6afd55c73dc53acf9d424d67f25db4d852) Thanks [@hunterbecton](https://github.com/hunterbecton)! - Add `@camp.dev/bones/server`: `streamBones` streams an HTML shell with busy `<bones-boundary>` regions and flushes out-of-order `<template>` + swap-script chunks as promises settle, plus the primitives (`BOOTSTRAP_SCRIPT`, `renderBoundary`, `renderChunk`, `renderErrorChunk`) that emit each wire-protocol piece for servers in any stack.

### Patch Changes

- [#38](https://github.com/campdotdev/bones/pull/38) [`9361a44`](https://github.com/campdotdev/bones/commit/9361a446a58dea687ad83bca2ab2f8d128021db8) Thanks [@hunterbecton](https://github.com/hunterbecton)! - Measured bones re-measure when the boundary's children or text change while busy, not only when the boundary resizes. Streamed and htmx-style swaps mid-skeleton now update the bars instead of leaving stale ones.

## 0.2.0

### Minor Changes

- [#30](https://github.com/campdotdev/bones/pull/30) [`0dbfce7`](https://github.com/campdotdev/bones/commit/0dbfce7c17a4998a5a81ab1787db7eff9b6a65a8) Thanks [@hunterbecton](https://github.com/hunterbecton)! - Add `@camp.dev/bones/auto.css`, an optional stylesheet that skeletonizes unmarked leaf elements under `[aria-busy="true"]`. Leaves render as typography-native text bones with deterministic width variance; images, media, and form controls fill their own box. `[data-bones-auto="off"]` exempts a subtree, explicit `data-bone` markup stays with `bones.css`, and reduced-motion and forced-colors modes are handled.

- [#31](https://github.com/campdotdev/bones/pull/31) [`b2c98c1`](https://github.com/campdotdev/bones/commit/b2c98c1301f9759e6b004c0d6075650a8f412d2f) Thanks [@hunterbecton](https://github.com/hunterbecton)! - Rename `@lovo/bones` to `@camp.dev/bones` and split it into subpath exports: the framework-agnostic core at the package root (`boneAttributes`, `minMax`, `resolveLength`), the React API at `@camp.dev/bones/react`, and the stylesheet at `@camp.dev/bones/css`. Update imports: `@lovo/bones` → `@camp.dev/bones/react`, `@lovo/bones/css` → `@camp.dev/bones/css`. `react` and `react-dom` are now optional peer dependencies.

## 0.1.2

### Patch Changes

- [#15](https://github.com/lovo-hq/bones/pull/15) [`3ca7852`](https://github.com/lovo-hq/bones/commit/3ca78522050cf07220802e6e5ce1599c535efefc) Thanks [@hunterbecton](https://github.com/hunterbecton)! - Add README to npm package page.

## 0.1.1

### Patch Changes

- [#10](https://github.com/lovo-hq/bones/pull/10) [`7704d83`](https://github.com/lovo-hq/bones/commit/7704d83aefcc08d89910a5a811b767bceaa71462) Thanks [@hunterbecton](https://github.com/hunterbecton)! - Initial release of @lovo/bones.

## 0.1.0

### Minor Changes

- [#5](https://github.com/lovo-hq/bones/pull/5) [`77af35f`](https://github.com/lovo-hq/bones/commit/77af35fbd8270ea007302f381cc45c21dc5f6729) Thanks [@hunterbecton](https://github.com/hunterbecton)! - Initial release of bones — primitives for inline skeleton loaders in React with Suspense and RSC support.
