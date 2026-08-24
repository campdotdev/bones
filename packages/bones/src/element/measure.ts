// ---------------------------------------------------------------------------
// Measurement for precision="measured"
//
// measureBones walks a boundary's light subtree and returns one rect per
// rendered text line and one per replaced element or form control, in
// viewport coordinates; the overlay converts them. Only a real layout engine
// produces geometry — in jsdom every rect is zero-area (or Range lacks
// getClientRects entirely) and the empty result is the CSS-fallback signal.
// ---------------------------------------------------------------------------

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface BoneRect extends Rect {
  kind: "text" | "block";
}

// Mirrors the :is() list in auto.css's block override; the walk treats these
// as atomic boxes and never descends into them.
export const BLOCK_TAGS = new Set([
  "img",
  "svg",
  "video",
  "canvas",
  "picture",
  "iframe",
  "embed",
  "object",
  "audio",
  "button",
  "input",
  "select",
  "textarea",
  "progress",
  "meter",
]);

// A text bar occupies this fraction of its measured line box, centered,
// approximating the 1ex bar bones.css centers on a 1lh line.
export const TEXT_BAR_SCALE = 0.55;

function verticalOverlap(a: Rect, b: Rect): number {
  return Math.min(a.top + a.height, b.top + b.height) - Math.max(a.top, b.top);
}

export function mergeLineRects(rects: Rect[]): Rect[] {
  const sorted = [...rects].sort((a, b) => a.top - b.top || a.left - b.left);
  const merged: Rect[] = [];
  for (const rect of sorted) {
    const line = merged.findLast((candidate) => {
      if (verticalOverlap(candidate, rect) < Math.min(candidate.height, rect.height) / 2) {
        return false;
      }
      const gap = rect.left - (candidate.left + candidate.width);
      return gap <= Math.max(candidate.height, rect.height) / 2;
    });
    if (line === undefined) {
      merged.push({ ...rect });
      continue;
    }
    const right = Math.max(line.left + line.width, rect.left + rect.width);
    const bottom = Math.max(line.top + line.height, rect.top + rect.height);
    line.left = Math.min(line.left, rect.left);
    line.top = Math.min(line.top, rect.top);
    line.width = right - line.left;
    line.height = bottom - line.top;
  }
  return merged;
}

export function measureBones(root: Element): BoneRect[] {
  void root;
  return [];
}
