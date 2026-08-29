# Bones

[![Bundle Size](https://deno.bundlejs.com/badge?q=@camp.dev/bones)](https://bundlejs.com/?q=%40camp.dev%2Fbones)

Automatic skeleton loaders for any stack. One stylesheet, one custom element. ~8.5 kB gzipped, 0 dependencies.

Set `aria-busy="true"` on a region and its content becomes a skeleton: a bar for every leaf, a box for every image and control. No skeleton components, no placeholder markup, no JavaScript in the loading path. When inference gets something wrong, a `data-bones-*` attribute on the real markup fixes it, and the attribute does nothing once the region is not busy.

## How it works

The stylesheet keys on `aria-busy="true"`. On that element and under it, an element with no element children paints as a text bar and an image or form control paints as a block. Text hides by zeroing the alpha of its own color, so bones take their color from the text around them and contrast on any background. `data-bones-type`, `data-bones-lines`, `data-bones-auto`, and `data-bones-animate` adjust the result. That is the whole API.

## Installation

```bash
npm install @camp.dev/bones
```

Import the stylesheet once in your root layout or entry point:

```tsx
import "@camp.dev/bones/css";
```

## Entry points

| Import                   | Contents                                                                                                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@camp.dev/bones/css`    | The stylesheet. Paints every leaf under `aria-busy="true"` and honors the `data-bones-*` attributes. Import once.                                                                                           |
| `@camp.dev/bones`        | `<bones-boundary>`, a custom element that sets `aria-busy` and `inert` on its subtree with `delay`, `min-duration`, and a crossfade. `precision="measured"` draws per-line bones measured from the content. |
| `@camp.dev/bones/server` | `streamBones` and the wire-protocol primitives: stream a shell with busy boundaries, then flush each region's content out of order as it resolves.                                                          |

Zero dependencies. No framework is required or assumed.

## Basic usage

Plain HTML:

```html
<section aria-busy="true">
  <img src="/avatar.png" width="64" height="64" alt="" />
  <h2>Sasha Greenfield</h2>
  <p>Collects tape loops, birdsong, and the hum of old refrigerators.</p>
</section>
```

In a framework, write the component so it renders its shell when the data is missing and forwards its props to the root. The skeleton is then the component with `aria-busy` and no data:

```tsx
import type { ComponentProps } from "react";

function ProfileCard({ user, ...rest }: { user?: User } & ComponentProps<"div">) {
  return (
    <div {...rest}>
      <img src={user?.avatar} width={80} height={80} alt="" />
      <h3>{user?.name}</h3>
      <p data-bones-lines="3">{user?.bio}</p>
      <ul>
        {(user?.posts ?? Array.from({ length: 3 })).map((post, i) => (
          <li key={post?.id ?? i}>{post?.title}</li>
        ))}
      </ul>
    </div>
  );
}

async function Profile() {
  return <ProfileCard user={await fetchUser()} />;
}

<Suspense fallback={<ProfileCard aria-busy="true" />}>
  <Profile />
</Suspense>;
```

The fallback is the component, and the async child is what suspends. `data-bones-lines="3"` says the bio is three lines tall while empty, and `Array.from` gives the list three placeholder rows, since CSS cannot add elements.

## Adjust a bone

| Attribute                                   | Effect                                                                                        |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `data-bones-type="text"`                    | Paint a text bar regardless of inference.                                                     |
| `data-bones-type="block"`                   | Paint one filled box and hide descendants. A `div` avatar, a card.                            |
| `data-bones-lines="3"`                      | Paint three stacked bars in one element. 2 to 8 everywhere; any integer with modern `attr()`. |
| `data-bones-auto="off"`                     | Keep this subtree readable. On `<body>`, only explicit markup paints.                         |
| `data-bones-animate="shimmer\|pulse\|none"` | Pick the animation for the bones inside, or on the bone itself.                               |

Explicit attributes are unlayered, so page CSS cannot keep their text visible. Inferred bones live in `@layer bones-auto`, so a page rule that sets `color` on a leaf keeps that text visible over its bar; that is the one thing to know when a bar looks wrong.

## Previewing skeletons

Render the component busy with no data. No promise, no boundary, no Storybook addon:

```tsx
<ProfileCard aria-busy="true" />
```

## Timing the swap

`<bones-boundary>` manages the loading state for any stack. Set `busy` when a request starts and clear it when the response lands. The element waits 200 ms before showing bones and keeps them for at least 400 ms, then crossfades to content with the View Transitions API where available.

```html
<script type="module">
  import "@camp.dev/bones";
</script>

<bones-boundary busy>
  <h2>Title</h2>
  <p>Body copy.</p>
</bones-boundary>
```

`@camp.dev/bones` is a bare specifier. A browser cannot resolve it on its own, so this snippet needs a bundler or an import map. To load the element straight from a CDN in a plain HTML file, see the URL form on the [bones-boundary docs page](https://github.com/campdotdev/bones/blob/main/apps/docs/content/docs/api/bones-boundary.mdx).

## Theming

`--bone-base`, `--bone-highlight`, `--bone-radius`, and `--bone-duration` are CSS custom properties; set them on any ancestor. `--bone-radius` must carry a unit. `prefers-reduced-motion` turns shimmer into a slow pulse; `data-bones-animate="none"` stays still.

## Development

```bash
vp install   # install dependencies
vp test      # run tests
vp pack      # build the library
```
