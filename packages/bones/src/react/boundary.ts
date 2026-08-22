import { createElement, type HTMLAttributes, type ReactNode, type Ref } from "react";
// A type-only import: it is erased at build time, so the rule that src/react
// never depends on src/element at runtime still holds. The element module is
// what registers the tag, and this file must not pull it into a bundle.
import type { BonesBoundary as BonesBoundaryElement } from "../element/boundary.ts";

// ---------------------------------------------------------------------------
// <BonesBoundary> — typed wrapper for the <bones-boundary> element
//
// No hooks, so it renders inside server components like <Bones> does. The
// attribute names are spelled out because React 19 serializes unknown props
// on a custom element by their prop name, and the element observes
// `min-duration`, not `minDuration`. Event props use React 19's rule for
// custom elements: an `on*` prop becomes addEventListener with the rest of
// the name as the event type. The element is registered by importing
// `@camp.dev/bones/element` once in a client entry; this file does not do it.
// ---------------------------------------------------------------------------

// Everything a plain <div> accepts, plus the element's own attributes. A
// boundary wraps real content, so `role`, `hidden`, `tabIndex`, `onClick`, and
// the rest of the aria-* set all have reasons to appear on it.
interface ElementAttributes extends HTMLAttributes<HTMLElement> {
  busy?: boolean;
  force?: boolean;
  delay?: number;
  "min-duration"?: number;
  transition?: "auto" | "none";
  // React maps `className` to class on custom elements too, but a raw
  // <bones-boundary> written by hand reads better with the HTML name.
  class?: string;
  ref?: Ref<BonesBoundaryElement>;
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "bones-boundary": ElementAttributes;
    }
  }
}

export interface BonesBoundaryProps extends Omit<
  ElementAttributes,
  "min-duration" | "inert" | "aria-busy" | "class"
> {
  minDuration?: number;
  onShow?: (event: CustomEvent) => void;
  onHide?: (event: CustomEvent) => void;
}

export function BonesBoundary({
  busy,
  force,
  delay,
  minDuration,
  transition,
  onShow,
  onHide,
  children,
  ...rest
}: BonesBoundaryProps): ReactNode {
  return createElement(
    "bones-boundary",
    {
      ...rest,
      busy: busy ? true : undefined,
      force: force ? true : undefined,
      delay,
      "min-duration": minDuration,
      transition,
      ...(force ? { "aria-busy": "true", inert: true } : {}),
      // The element writes aria-busy and inert itself, and it can have done so
      // before hydration reaches this subtree. React must not treat those
      // attributes as a mismatch against the server HTML and warn about them.
      suppressHydrationWarning: true,
      "onbones:show": onShow,
      "onbones:hide": onHide,
    },
    children,
  );
}
