import { use, type ReactNode } from "react";

// Suspends on `promise`, then renders `children` with its value. Components in
// this demo take data, not promises, so the page decides where each Suspense
// boundary sits and the same component renders both states.
export function Await<T>({
  promise,
  children,
}: {
  promise: Promise<T>;
  children: (value: T) => ReactNode;
}) {
  return children(use(promise));
}
