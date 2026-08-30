// The whole vanilla "renderer": one function that sets aria-busy on a region
// and takes it off again. It waits `delay` before marking the region busy, so
// a fast response never flashes a skeleton, and keeps the region busy for at
// least `minDuration` once shown, so a slow one never strobes. `inert` goes
// on with aria-busy so the skeleton's controls leave the tab order. The
// markup already carries data-bones-lines where a paragraph wraps; the
// stylesheet infers everything else while the region is busy.
//
// The docs' "Delay and hold" recipe is this file without the types.

export interface BusyOptions {
  delay?: number;
  minDuration?: number;
}

export function busy(
  region: HTMLElement,
  { delay = 200, minDuration = 400 }: BusyOptions = {},
): () => void {
  let shownAt = 0;
  const show = setTimeout(() => {
    shownAt = Date.now();
    region.setAttribute("aria-busy", "true");
    region.toggleAttribute("inert", true);
  }, delay);

  return function done(): void {
    clearTimeout(show);
    if (shownAt === 0) return; // never shown: nothing to hide
    const hide = (): void => {
      region.removeAttribute("aria-busy");
      region.removeAttribute("inert");
    };
    const remaining = Math.max(0, shownAt + minDuration - Date.now());
    setTimeout(() => {
      const still =
        typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (typeof document.startViewTransition === "function" && !still) {
        document.startViewTransition(hide);
      } else {
        hide();
      }
    }, remaining);
  };
}
