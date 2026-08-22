# bones

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
