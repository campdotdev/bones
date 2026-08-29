# Bones

[![Bundle Size](https://deno.bundlejs.com/badge?q=@camp.dev/bones)](https://bundlejs.com/?q=%40camp.dev%2Fbones)

Skeleton loaders designed for React Server Components and streaming.

With React Server Components, your component renders once on the server. There's no re-render from "loading" to "loaded," so `{data || <Skeleton />}` doesn't work anymore. The typical workaround is writing a separate skeleton component for every piece of UI and passing it as a Suspense fallback.

Bones skips the duplication. You write your markup once and it handles both states. The skeleton and the real UI are the same component, so they can't drift apart.

## How it works

`createBones` accepts data or a promise of data. While loading, its `bone` function returns HTML attributes that style elements as skeletons via CSS. Once the data resolves, `bone` returns an empty object and your component renders normally. There are no hooks and no context providers.

- Works in Server Components. No hooks, no context, no `'use client'`.
- One component handles both loading and loaded states.
- Pass data or a promise. A pending promise suspends to your `<Suspense>` boundary; `forceBones` renders the skeleton.
- Skeletons are pure CSS, themed with custom properties.
- Loading elements get `aria-busy="true"` automatically.

## Installation

```bash
npm install @camp.dev/bones
```

Import the CSS once in your root layout or entry point:

```tsx
import "@camp.dev/bones/css";
```

## Entry points

| Import                     | Contents                                                                                                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@camp.dev/bones/react`    | `createBones`, `readPromise`, `forceBones`, `minMax`, `isMinMax`, `BonesBoundary`                                                                                                                                          |
| `@camp.dev/bones/css`      | The skeleton stylesheet. Import once in your root layout.                                                                                                                                                                  |
| `@camp.dev/bones/auto.css` | Skeletonizes unmarked leaves under `aria-busy="true"`. Imports the base stylesheet itself, so a separate `/css` import is optional.                                                                                        |
| `@camp.dev/bones/element`  | `<bones-boundary>`, a custom element that sets `aria-busy` and `inert` on its subtree with `delay`, `min-duration`, and a crossfade. `precision="measured"` draws pixel-accurate per-line bones measured from the content. |
| `@camp.dev/bones/server`   | `streamBones` and the wire-protocol primitives: stream a shell with busy boundaries, then flush each region's content out of order as it resolves.                                                                         |
| `@camp.dev/bones`          | The framework-agnostic core (`boneAttributes`, `minMax`). You only need this to build your own renderer or adapter.                                                                                                        |

React is an optional peer dependency: installing the package without React is supported and only the `/react` entry requires it.

## Basic usage

Pass data (or a promise of data) to `createBones`. Spread the `bone` function's return value onto elements that should show skeletons while loading.

```tsx
import { createBones } from "@camp.dev/bones/react";

function ProfileCard({ user }: { user: Promise<User> | User }) {
  const { bone, data, lines } = createBones(user);

  return (
    <div>
      <img src={data?.avatar} width={80} height={80} {...bone("block")} />
      <h3 {...bone("text", { length: 10 })}>{data?.name}</h3>
      {lines(data?.bio, 3, (item) => (
        <p>{item}</p>
      ))}
    </div>
  );
}
```

Pass the promise to the component, and reuse the same component with `forceBones` as the fallback:

```tsx
import { forceBones } from "@camp.dev/bones/react";
import { Suspense } from "react";

export default function Page() {
  const user = fetchUser();
  return (
    <Suspense fallback={<ProfileCard user={forceBones} />}>
      <ProfileCard user={user} />
    </Suspense>
  );
}
```

While the promise is pending, the fallback renders `<ProfileCard>` with skeletons visible. Once it resolves, the real content swaps in. There is no separate skeleton component to keep in sync — the fallback is the component.

## Bone types

| Type          | Use for                        | Example                              |
| ------------- | ------------------------------ | ------------------------------------ |
| `"text"`      | Headings, paragraphs, labels   | `<h2 {...bone("text")}>`             |
| `"block"`     | Images, avatars, thumbnails    | `<img src={…} {...bone("block")} />` |
| `"container"` | Wrappers with complex children | `<div {...bone("container")}>`       |

## Previewing skeletons

Use `forceBones` to see a component's skeleton state without setting up real data:

```tsx
import { createBones, forceBones } from "@camp.dev/bones/react";

<ProfileCard user={forceBones} />;
```

To force a subtree into skeleton mode at once, pass `forceBones` to each component in it:

```tsx
<ProfileCard user={forceBones} />
<PostList posts={forceBones} />
```

`forceBones` only forces the component it's passed to. A component that derives child props from its own data must forward it itself, such as `PostList` mapping items into cards. `repeat` yields `undefined` for items that don't exist yet:

```tsx
<PostCard key={item?.id ?? i} post={item ?? forceBones} />
```

For content that has no bone markup at all, wrap it in [`<bones-boundary force>`](apps/docs/content/docs/api/bones-boundary.mdx) and let `auto.css` draw leaf bones.

## Automatic skeletons

For markup you haven't wired up with `bone()` — third-party components, server-rendered HTML, anything without explicit attributes — import the auto stylesheet. It imports `/css` itself, so this one file is a complete setup:

```tsx
import "@camp.dev/bones/auto.css";
```

Set `aria-busy="true"` on the loading region and every unmarked leaf inside it becomes a skeleton, no `bone()` calls required:

```html
<section aria-busy="true">
  <h2>Title</h2>
  <p>Summary text goes here.</p>
</section>
```

`[data-bones-auto="off"]` opts a subtree out — useful for a status message you want to stay readable while its container skeletonizes. Images, video, and canvas get a solid bone even after they have loaded. A loaded `iframe`, `embed`, or `object` still shows its content, because those elements ignore `object-position`. Explicit `data-bone` markup is left alone; `auto.css` only styles elements neither `bone()` nor a manual `data-bone` attribute has already claimed.

Auto rules live in `@layer bones-auto`, so any page CSS that sets `color` on an element outranks the bone's transparent text, and that text stays visible over its skeleton bar. `data-bone-animate` works on the `aria-busy` element itself or on any ancestor. The `data-bone-animate` overrides rely on `@scope`. In a browser without `@scope`, every bone shimmers, and `data-bone-animate="pulse"` and `"none"` cannot change that. The `prefers-reduced-motion` fallback to pulse still applies.

## Without React

`<bones-boundary>` manages the loading state for any stack. Set `busy` when a request starts and clear it when the response lands. The element waits 200 ms before showing bones and keeps them for at least 400 ms, then crossfades to content with the View Transitions API where available.

```html
<script type="module">
  import "@camp.dev/bones/element";
</script>

<bones-boundary busy>
  <h2>Title</h2>
  <p>Body copy.</p>
</bones-boundary>
```

`@camp.dev/bones/element` is a bare specifier. A browser cannot resolve it on its own, so this snippet needs a bundler or an import map. To load the element straight from a CDN in a plain HTML file, see the URL form on the [bones-boundary docs page](apps/docs/content/docs/api/bones-boundary.mdx).

Pair it with `auto.css` for zero-markup skeletons, or with `data-bone` markup from `boneAttributes`. The element is also exported for React as `<BonesBoundary>` from `@camp.dev/bones/react`.

## Development

```bash
vp install   # install dependencies
vp test      # run tests
vp pack      # build the library
```
