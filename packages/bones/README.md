# Bones

Automatic skeleton loaders for any stack. One stylesheet, ~5.7 kB gzipped, no JavaScript, 0 dependencies.

Set `aria-busy="true"` on a region and its content becomes a skeleton: a bar for every leaf, a box for every image and control. No skeleton components, no placeholder markup, no JavaScript in the loading path. When inference gets something wrong, a `data-bones-*` attribute on the real markup fixes it, and the attribute does nothing once the region is not busy.

## How it works

The stylesheet keys on `aria-busy="true"`. On that element and under it, an element with no element children paints as a text bar and an image or form control paints as a block. Text hides by zeroing the alpha of its own color, so bones take their color from the text around them and contrast on any background. `data-bones-type`, `data-bones-lines`, `data-bones-length`, `data-bones-auto`, and `data-bones-animate` adjust the result. That is the whole API.

## Installation

```bash
npm install @camp.dev/bones
```

Import the stylesheet once in your root layout or entry point:

```tsx
import "@camp.dev/bones/css";
```

Without a bundler, link it from a CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/@camp.dev/bones/src/css/bones.css" />
```

## Entry points

| Import                | Contents                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `@camp.dev/bones/css` | The stylesheet. Paints every leaf under `aria-busy="true"` and honors the `data-bones-*` attributes. Import once. |

Zero dependencies. No framework is required or assumed, and nothing ships JavaScript.

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
| `data-bones-length="9"`                     | Make the bar nine characters wide. 1 to 40 everywhere; any integer with modern `attr()`.      |
| `data-bones-auto="off"`                     | Keep this subtree readable. On `<body>`, only explicit markup paints.                         |
| `data-bones-animate="shimmer\|pulse\|none"` | Pick the animation for the bones inside, or on the bone itself.                               |

Explicit attributes are unlayered, so page CSS cannot keep their text visible without a more specific rule of its own. Inferred bones live in `@layer bones-auto`, so a page rule that sets `color` on a leaf keeps that text visible over its bar; that is the one thing to know when a bar looks wrong. A bar sits inside its element's padding, so a badge or a pill keeps its shape while it loads. Padding in `px`, `em`, or `rem` is exact; percentage padding misses.

## Update part of a page

`aria-busy` marks the element it sits on and every element under it, so one value and a whole page use the same attribute. Put `aria-busy` on the smallest element that owns the data that is changing.

To repaint one value inside a component that is otherwise loaded, mark that value:

```html
<article class="product-card">
  <img src="/shoe.png" width="240" height="240" alt="" />
  <h3>Trail Runner</h3>
  <span class="price" aria-busy="true">$129.00</span>
</article>
```

Only the price paints. The image and the heading stay readable. To repaint one card in a grid, move `aria-busy` to that card's root and leave the grid alone. Nothing above the busy element has to know.

Check two things on the element you mark:

- If it has element children, each child paints its own bar. `<span class="price"><sup>$</sup>129</span>` gives you two. Add `data-bones-type="text"` to the wrapper for a single bar, since descendants of an explicit bone are exempt from inference. A page rule that sets `color` on a child still keeps that child's text visible over the bar.
- If it is inline and holds its old text, the bar is as wide as that text, so nothing reflows while the new value loads. If it is empty, `min-width` does not apply to an inline box. Set `data-bones-length="7"` to give the bar a width.

`aria-busy="false"` on a descendant does not cancel a busy ancestor. Busy regions nest and add. They never subtract. To keep one subtree readable inside a busy region, use `data-bones-auto="off"`. That attribute turns off inference only, so an explicit `data-bones-type` or `data-bones-lines` under it still paints.

## Previewing skeletons

Render the component busy with no data. No promise, no boundary, no Storybook addon:

```tsx
<ProfileCard aria-busy="true" />
```

## Focus and timing

A skeleton's links and buttons are still focusable. Put `inert` beside `aria-busy` on a fallback that renders any:

```tsx
<Suspense fallback={<ProfileCard aria-busy="true" inert />}>
```

Suspense paints the skeleton first, so it never flashes. A region you mark busy around your own `fetch` can. The docs' [Delay and hold](https://github.com/campdotdev/bones/blob/main/apps/docs/content/docs/examples.mdx#delay-and-hold) recipe waits before showing bones and keeps them long enough once shown; [Streaming](https://github.com/campdotdev/bones/blob/main/apps/docs/content/docs/streaming.mdx) shows the swap script for a server with no framework.

## Integrations

Turbo sets `aria-busy` on frames and forms by itself; React, Vue, and Svelte bind it in the template; htmx and Livewire wire it in a line or two. The docs' [Integrations](https://github.com/campdotdev/bones/blob/main/apps/docs/content/docs/integrations.mdx) page has the per-stack recipes and a bookmarklet that skeletonizes any page.

## Theming

`--bone-base`, `--bone-highlight`, `--bone-radius`, and `--bone-duration` are CSS custom properties; set them on any ancestor. `--bone-radius` must carry a unit. `prefers-reduced-motion` turns shimmer into a slow pulse; `data-bones-animate="none"` stays still.

## Development

```bash
vp install   # install dependencies
vp test      # run tests
```
