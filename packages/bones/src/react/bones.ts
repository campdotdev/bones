import { Suspense, Children, cloneElement, isValidElement, createElement, Fragment } from "react";
import type { ReactNode } from "react";
import { forceBones, getBonesContext } from "./create-bones.ts";

// ---------------------------------------------------------------------------
// BonesStart / BonesEnd — bracket the fallback tree to scope the loading flag
//
// React renders fragment children in order (depth-first), so BonesStart runs
// before the skeleton tree renders and BonesEnd after. Increment/decrement
// rather than set/clear so nested boundaries restore the outer level instead
// of clobbering it (BON-11), and so StrictMode's symmetric double render
// stays balanced.
// ---------------------------------------------------------------------------

function BonesStart(): null {
  getBonesContext().depth += 1;
  return null;
}

function BonesEnd(): null {
  const context = getBonesContext();
  if (context.depth > 0) context.depth -= 1;
  return null;
}

function swapPromises(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const props: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(child.props as Record<string, unknown>)) {
      props[key] = value instanceof Promise ? forceBones : value;
    }
    return cloneElement(child, props);
  });
}

// ---------------------------------------------------------------------------
// <Bones> — Suspense wrapper with automatic skeleton fallback
//
// Renders children inside a Suspense boundary. The fallback is the same
// component tree with promise props swapped for forceBones, and a loading
// flag set via cache() so all nested createBones calls show skeletons.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// <BonesForce> — force skeleton mode for an entire subtree
//
// Sets the cache()-based loading flag around children so every nested
// createBones call shows skeletons. Useful for demos, Storybook, and tests.
// ---------------------------------------------------------------------------

export function BonesForce({ children }: { children: ReactNode }): ReactNode {
  return createElement(
    Fragment,
    null,
    createElement(BonesStart),
    children,
    createElement(BonesEnd),
  );
}

export function Bones({ children }: { children: ReactNode }): ReactNode {
  const fallback = createElement(
    Fragment,
    null,
    createElement(BonesStart),
    swapPromises(children),
    createElement(BonesEnd),
  );

  return createElement(Suspense, { fallback }, children);
}
