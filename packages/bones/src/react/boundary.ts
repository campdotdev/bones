import { createElement, type CSSProperties, type ReactNode, type Ref } from "react";

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

type ElementAttributes = {
  busy?: boolean;
  force?: boolean;
  delay?: number;
  "min-duration"?: number;
  transition?: "auto" | "none";
  inert?: boolean;
  "aria-busy"?: "true" | "false";
  class?: string;
  className?: string;
  style?: CSSProperties;
  id?: string;
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
};

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
      "onbones:show": onShow,
      "onbones:hide": onHide,
    },
    children,
  );
}
