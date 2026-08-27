import {
  Suspense,
  Children,
  Component,
  cloneElement,
  isValidElement,
  createElement,
  Fragment,
} from "react";
import type { ReactNode } from "react";
import { forceBones, getBonesContext, isRequestScopedContext } from "./create-bones.ts";

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

// ---------------------------------------------------------------------------
// BonesRecover — undo a bracket a thrown child tore open
//
// A child that throws between BonesStart and BonesEnd unwinds past BonesEnd,
// leaving the module context's depth raised for every render that follows the
// error boundary (the request context cannot leak this way — it dies with its
// request, which is also why this class is skipped there: class components
// cannot render in Server Components). On catch, the re-render restores the
// depth captured before the bracket opened and rethrows for the app's own
// boundary. The restore lives in render, not componentDidCatch, because a
// boundary whose render rethrows never commits; the assignment is idempotent,
// so React re-invoking the render is harmless. A suspended (not thrown)
// child still bypasses this — error boundaries never see promises.
// ---------------------------------------------------------------------------

type BracketRecord = { prev: number };

class BonesRecover extends Component<
  { record: BracketRecord; children: ReactNode },
  { caught: boolean; error?: unknown }
> {
  override state: { caught: boolean; error?: unknown } = { caught: false };

  static getDerivedStateFromError(error: unknown): { caught: boolean; error?: unknown } {
    return { caught: true, error };
  }

  override render(): ReactNode {
    if (this.state.caught) {
      getBonesContext().depth = this.props.record.prev;
      throw this.state.error;
    }
    return this.props.children;
  }
}

function bracket(children: ReactNode): ReactNode {
  const record: BracketRecord = { prev: getBonesContext().depth };
  const guarded = isRequestScopedContext()
    ? children
    : createElement(BonesRecover, { record }, children);
  return createElement(Fragment, null, createElement(BonesStart), guarded, createElement(BonesEnd));
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
  return bracket(children);
}

export function Bones({ children }: { children: ReactNode }): ReactNode {
  const fallback = bracket(swapPromises(children));

  return createElement(Suspense, { fallback }, children);
}
