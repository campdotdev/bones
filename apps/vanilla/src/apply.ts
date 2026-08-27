import { TRANSPARENT_PIXEL, type BoneAttributes } from "@camp.dev/bones";

// The whole vanilla "renderer": copy the attribute contract from
// boneAttributes() onto a live element, and take it off again.

export function applyBone(el: HTMLElement, attrs: BoneAttributes): void {
  el.setAttribute("data-bone", attrs["data-bone"]);
  el.setAttribute("aria-busy", "true");
  if (attrs.src) el.setAttribute("src", attrs.src);
  for (const [property, value] of Object.entries(attrs.style ?? {})) {
    el.style.setProperty(property, String(value));
  }
}

export function clearBone(el: HTMLElement): void {
  el.removeAttribute("data-bone");
  el.removeAttribute("aria-busy");
  if (el.getAttribute("src") === TRANSPARENT_PIXEL) el.removeAttribute("src");
  el.style.removeProperty("--bone-length");
  el.style.removeProperty("--bone-contained");
}
