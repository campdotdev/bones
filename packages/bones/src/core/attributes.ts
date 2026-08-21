export type BoneType = "text" | "block" | "container";

// ---------------------------------------------------------------------------
// minMax — variable-length skeleton helper
//
// Returns a descriptor that `boneAttributes("text", { length: minMax(4, 12) })`
// uses to produce a different deterministic width per call index. Ideal inside
// repeat() loops for natural-looking skeleton lists.
// ---------------------------------------------------------------------------

const MIN_MAX_BRAND = Symbol("minMax");

export interface MinMax {
  readonly [MIN_MAX_BRAND]: true;
  readonly min: number;
  readonly max: number;
}

export function minMax(min: number, max: number): MinMax {
  return { [MIN_MAX_BRAND]: true, min, max };
}

export function isMinMax(value: unknown): value is MinMax {
  return typeof value === "object" && value !== null && MIN_MAX_BRAND in value;
}

export interface BoneOptions {
  length?: number | MinMax;
  contained?: boolean;
}

// ---------------------------------------------------------------------------
// boneAttributes — the framework-agnostic attribute contract
//
// Returns the HTML attributes that mark an element as a skeleton for the CSS
// engine: `data-bone` marks shape, `aria-busy` marks state. Renderers (the
// React adapter in src/react, future custom elements) spread or set these
// on elements.
// ---------------------------------------------------------------------------

export interface BoneAttributes {
  "data-bone": BoneType;
  "aria-busy": true;
  src?: string;
  style?: Record<string, number>;
}

export const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export function resolveLength(
  length: number | MinMax | undefined,
  callIndex: number,
): number | undefined {
  if (length == null) return undefined;
  if (typeof length === "number") return length;
  // MinMax: deterministic variation based on call index
  const range = length.max - length.min + 1;
  return length.min + ((callIndex * 7 + 3) % range);
}

export function boneAttributes(
  type: BoneType,
  options?: BoneOptions,
  callIndex = 0,
): BoneAttributes {
  const attrs: BoneAttributes = { "data-bone": type, "aria-busy": true };

  if (type === "text") {
    const style: Record<string, number> = {};
    if (options?.contained) {
      style["--bone-contained"] = 1;
    }
    const length = resolveLength(options?.length, callIndex);
    if (length) {
      style["--bone-length"] = length;
    }
    if (Object.keys(style).length > 0) attrs.style = style;
  }

  if (type === "block") {
    attrs.src = TRANSPARENT_PIXEL;
  }

  return attrs;
}
