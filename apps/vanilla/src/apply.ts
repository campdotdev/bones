// The whole vanilla "renderer": one attribute on one element. The markup
// already carries data-bones-lines where a paragraph wraps; everything else
// is inferred by the stylesheet while the region is busy.

export function setLoading(region: HTMLElement, loading: boolean): void {
  if (loading) region.setAttribute("aria-busy", "true");
  else region.removeAttribute("aria-busy");
}
