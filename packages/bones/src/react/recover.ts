"use client";
import { Component } from "react";
import type { ReactNode } from "react";
import { getBonesContext } from "./create-bones.ts";

// ---------------------------------------------------------------------------
// BonesRecover — undo a bracket a thrown child tore open
//
// A child that throws between BonesStart and BonesEnd unwinds past BonesEnd,
// leaving the module context's depth raised for every render that follows
// the error boundary. On catch, the re-render restores the depth captured
// before the bracket opened and rethrows for the app's own boundary.
//
// A separate "use client" module because class components cannot render in
// Server Components — RSC bundlers reject the Component import in a server
// module outright. The brackets only render this on the module-context path;
// the request context dies with its request, so it cannot leak there, and
// the client reference stays unused. The restore lives in render, not
// componentDidCatch, because a boundary whose render rethrows never commits;
// the assignment is idempotent, so React re-invoking render is harmless. A
// suspended (not thrown) child still bypasses this — error boundaries never
// see promises.
// ---------------------------------------------------------------------------

export type BracketRecord = { prev: number };

type RecoverProps = { record: BracketRecord; children?: ReactNode };
type RecoverState = { caught: boolean; error?: unknown };

export class BonesRecover extends Component<RecoverProps, RecoverState> {
  override state: RecoverState = { caught: false };

  static getDerivedStateFromError(error: unknown): RecoverState {
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
