import { cache, cloneElement, createElement, isValidElement, type ReactNode } from "react";
import { boneAttributes } from "../core/attributes.ts";
import type { BoneOptions, BoneType, MinMax } from "../core/attributes.ts";

// Re-export the framework-agnostic pieces so the React entry's public API is
// unchanged by the core extraction.
export { minMax, isMinMax } from "../core/attributes.ts";
export type { BoneOptions, BoneType, MinMax };

// ---------------------------------------------------------------------------
// Loading context: React.cache per request, with a module fallback
//
// cache() memoizes per request only inside React Server Components. In client
// renders and non-RSC server rendering it returns a fresh value per call, so
// a flag set by a parent would be written to an object no descendant ever
// reads (BON-14). Calling the getter twice tells the two worlds apart:
// identical objects mean a request-scoped context (safe under concurrent
// requests), different objects mean the passthrough, where a module-level
// context is the sharing mechanism — fine because those render passes are
// synchronous, with brackets balanced within the pass.
//
// `depth` instead of a boolean so boundaries nest (BON-11): an inner
// boundary's end decrements back to the outer boundary's level instead of
// clearing the flag for the outer boundary's later siblings. A counter also
// survives StrictMode's double render, which invokes each bracket twice.
// ---------------------------------------------------------------------------

type BonesContext = { depth: number; readonly loading: boolean };

function createBonesContext(): BonesContext {
  return {
    depth: 0,
    get loading() {
      return this.depth > 0;
    },
  };
}

const moduleContext = createBonesContext();
const getRequestContext = cache(createBonesContext);

export function getBonesContext(): BonesContext {
  const context = getRequestContext();
  return context === getRequestContext() ? context : moduleContext;
}

export function isRequestScopedContext(): boolean {
  return getRequestContext() === getRequestContext();
}

function withKey(node: ReactNode, key: string | number): ReactNode {
  return isValidElement(node) ? cloneElement(node, { key }) : node;
}

// ---------------------------------------------------------------------------
// readPromise — throw-promise pattern for Suspense integration
//
// Augments the promise with status fields (same approach as React's `use()`
// internals) so that settled state is readable synchronously on any call
// after the resolution microtask has fired.
// ---------------------------------------------------------------------------

type TrackedPromise<T> = Promise<T> & {
  _status?: "pending" | "fulfilled" | "rejected";
  _result?: T;
  _error?: unknown;
};

export function readPromise<T>(promise: Promise<T>): T {
  const tracked = promise as TrackedPromise<T>;

  if (tracked._status === undefined) {
    tracked._status = "pending";
    promise.then(
      (result) => {
        tracked._status = "fulfilled";
        tracked._result = result;
      },
      (error) => {
        tracked._status = "rejected";
        tracked._error = error;
      },
    );
  }

  if (tracked._status === "fulfilled") return tracked._result as T;
  if (tracked._status === "rejected") throw tracked._error;
  throw promise;
}

// ---------------------------------------------------------------------------
// createBones — synchronous skeleton utility (no hooks required)
//
// Returns a `bone` prop-factory, the resolved `data`, and a `repeat` helper.
// When `data` is a Promise it delegates to `readPromise` for Suspense support.
// ---------------------------------------------------------------------------

type BoneProps = Record<string, unknown>;

// ---------------------------------------------------------------------------
// forceBones — sentinel for forced skeleton mode
//
// A frozen object that createBones recognises by identity. Pass it as data
// to force skeleton mode without a real promise or Suspense boundary.
// Typed as Promise<never> so it's assignable to any Promise<T> prop.
// ---------------------------------------------------------------------------

export const forceBones = Object.freeze({}) as unknown as Promise<never>;

export interface CreateBonesOptions {
  loading?: boolean;
}

export interface CreateBonesReturn<T> {
  bone: {
    (type: "text", options?: BoneOptions): BoneProps;
    (type: "block" | "container"): BoneProps;
  };
  data: T | null | undefined;
  repeat: <U>(
    arr: U[] | undefined | null,
    count: number,
    render: (item: U | undefined, index: number) => ReactNode,
  ) => ReactNode[];
  lines: <V>(
    value: V | null | undefined,
    count: number,
    render: (item: V | ReactNode) => ReactNode,
  ) => ReactNode[];
}

export function createBones(options: CreateBonesOptions): CreateBonesReturn<never>;
export function createBones<T>(
  data: T | Promise<T> | undefined | null,
  options?: CreateBonesOptions,
): CreateBonesReturn<T>;
export function createBones<T>(
  dataOrOptions?: T | Promise<T> | null | CreateBonesOptions,
  maybeOptions?: CreateBonesOptions,
): CreateBonesReturn<T> {
  let data: T | Promise<T> | undefined | null;
  let options: CreateBonesOptions | undefined;

  if (
    maybeOptions === undefined &&
    dataOrOptions !== null &&
    dataOrOptions !== undefined &&
    typeof dataOrOptions === "object" &&
    !(dataOrOptions instanceof Promise) &&
    "loading" in dataOrOptions
  ) {
    data = undefined;
    options = dataOrOptions as CreateBonesOptions;
  } else {
    data = dataOrOptions as T | Promise<T> | undefined | null;
    options = maybeOptions;
  }

  let resolved: T | undefined | null;
  let isLoading = false;

  if (options?.loading) {
    // Explicit loading flag — show skeletons regardless of data state.
    isLoading = true;
    resolved = undefined;
  } else if (data != null && (data as unknown) === forceBones) {
    // Explicit force — show skeletons regardless.
    isLoading = true;
    resolved = undefined;
  } else if (getBonesContext().loading) {
    // Inherited from a <Bones> boundary — show skeletons.
    isLoading = true;
    resolved = undefined;
  } else if (data != null && data instanceof Promise) {
    // Promise path — delegates to readPromise for Suspense integration.
    // Throws for pending promises; returns data for fulfilled ones.
    resolved = readPromise(data);
  } else {
    resolved = data as T | undefined | null;
  }

  let boneCallIndex = 0;

  const bone = (type: BoneType, options?: BoneOptions): BoneProps => {
    if (!isLoading) return {};
    return { ...boneAttributes(type, options, boneCallIndex++) };
  };

  function repeat<U>(
    arr: U[] | undefined | null,
    count: number,
    render: (item: U | undefined, index: number) => ReactNode,
  ): ReactNode[] {
    const items: (U | undefined)[] = isLoading ? Array.from({ length: count }) : (arr ?? []);
    return items.map(render);
  }

  function lines<V>(
    value: V | null | undefined,
    count: number,
    render: (item: V | ReactNode) => ReactNode,
  ): ReactNode[] {
    if (isLoading) {
      const spans = Array.from({ length: count }, (_, i) =>
        createElement("span", {
          key: i,
          "data-bone-line": true,
          ...bone("text"),
        }),
      );
      return [withKey(render(spans), 0)];
    }
    if (value == null) return [];
    return [withKey(render(value), 0)];
  }

  return { bone, data: isLoading ? undefined : (resolved as T), repeat, lines };
}
