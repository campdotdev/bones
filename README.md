# Bones

[![Bundle Size](https://deno.bundlejs.com/badge?q=@camp-dev/bones)](https://bundlejs.com/?q=%40camp-dev%2Fbones)

Skeleton loaders designed for React Server Components and streaming.

With React Server Components, your component renders once on the server. There's no re-render from "loading" to "loaded," so `{data || <Skeleton />}` doesn't work anymore. The typical workaround is writing a separate skeleton component for every piece of UI and passing it as a Suspense fallback.

Bones skips the duplication. You write your markup once and it handles both states. The skeleton and the real UI are the same component, so they can't drift apart.

## How it works

`createBones` accepts data or a promise of data. While loading, its `bone` function returns HTML attributes that style elements as skeletons via CSS. Once the data resolves, `bone` returns an empty object and your component renders normally. There are no hooks and no context providers.

- Works in Server Components. No hooks, no context, no `'use client'`.
- One component handles both loading and loaded states.
- Pass a promise as a prop. Bones wires up Suspense for you.
- Skeletons are pure CSS, themed with custom properties.
- Loading elements get `aria-busy="true"` automatically.

## Installation

```bash
npm install @camp-dev/bones
```

Import the CSS once in your root layout or entry point:

```tsx
import "@camp-dev/bones/css";
```

## Entry points

| Import                     | Contents                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `@camp-dev/bones/react`    | `createBones`, `readPromise`, `forceBones`, `minMax`, `<Bones>`, `<BonesForce>`                                           |
| `@camp-dev/bones/css`      | The skeleton stylesheet. Import once in your root layout.                                                                 |
| `@camp-dev/bones/auto.css` | Skeletonizes unmarked leaves under `aria-busy="true"`. Import alongside `/css`, or instead of hand-marking every element. |
| `@camp-dev/bones`          | The framework-agnostic core (`boneAttributes`, `minMax`). You only need this to build your own renderer or adapter.       |

React is an optional peer dependency: installing the package without React is supported and only the `/react` entry requires it.

## Basic usage

Pass data (or a promise of data) to `createBones`. Spread the `bone` function's return value onto elements that should show skeletons while loading.

```tsx
import { createBones } from "@camp-dev/bones/react";

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

Wrap components that receive promises in `<Bones>`. It creates a Suspense boundary and generates the skeleton fallback for you:

```tsx
import { Bones } from "@camp-dev/bones/react";

export default function Page() {
  return (
    <Bones>
      <ProfileCard user={fetchUser()} />
    </Bones>
  );
}
```

While the promise is pending, `<Bones>` renders the same `<ProfileCard>` tree with skeletons visible. Once it resolves, the real content swaps in.

## Bone types

| Type          | Use for                        | Example                              |
| ------------- | ------------------------------ | ------------------------------------ |
| `"text"`      | Headings, paragraphs, labels   | `<h2 {...bone("text")}>`             |
| `"block"`     | Images, avatars, thumbnails    | `<img src={…} {...bone("block")} />` |
| `"container"` | Wrappers with complex children | `<div {...bone("container")}>`       |

## Previewing skeletons

Use `forceBones` to see a component's skeleton state without setting up real data:

```tsx
import { createBones, forceBones } from "@camp-dev/bones/react";

<ProfileCard user={forceBones} />;
```

To force an entire subtree into skeleton mode at once, wrap it with `<BonesForce>`:

```tsx
import { BonesForce } from "@camp-dev/bones/react";

<BonesForce>
  <ProfileCard />
  <PostList />
</BonesForce>;
```

## Automatic skeletons

For markup you haven't wired up with `bone()` — third-party components, server-rendered HTML, anything without explicit attributes — import the auto stylesheet instead of, or alongside, `/css`:

```tsx
import "@camp-dev/bones/auto.css";
```

Set `aria-busy="true"` on the loading region and every unmarked leaf inside it becomes a skeleton, no `bone()` calls required:

```html
<section aria-busy="true">
  <h2>Title</h2>
  <p>Summary text goes here.</p>
</section>
```

`[data-bones-auto="off"]` opts a subtree out — useful for a status message you want to stay readable while its container skeletonizes. Explicit `data-bone` markup is left alone; `auto.css` only styles elements neither `bone()` nor a manual `data-bone` attribute has already claimed.

Auto rules live in `@layer bones-auto`, so any page CSS that sets `color` on an element outranks the bone's transparent text, and that text stays visible over its skeleton bar. `data-bone-animate` also has to sit on an ancestor of the `aria-busy` element — set directly on it, it has no effect.

## Development

```bash
vp install   # install dependencies
vp test      # run tests
vp pack      # build the library
```
