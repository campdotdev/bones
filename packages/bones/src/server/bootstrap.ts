// ---------------------------------------------------------------------------
// The inline swap runtime, sent once per streamed document.
//
// Readable form (the tests execute the shipped string against both branches):
//
//   function __bonesSwap(id, err) {
//     var t = document.querySelector('template[data-bones-chunk="' + id + '"]');
//     var b = document.querySelector('[data-bones-slot="' + id + '"]');
//     if (!b) { if (t) t.remove(); return; }
//     if (t) { b.replaceChildren(t.content); t.remove(); }
//     if (err) b.setAttribute("data-bones-error", "");
//     if (typeof b.busy === "boolean") b.busy = false;
//     else {
//       b.removeAttribute("busy");
//       b.removeAttribute("aria-busy");
//       b.removeAttribute("inert");
//     }
//   }
//
// The typeof check picks the path. An upgraded <bones-boundary> gets
// `busy = false` and runs its own draining and hide machinery. Anything else
// — the element module absent or still loading, or a plain [data-bones-slot]
// target — gets the three attributes removed directly. Clearing aria-busy or
// inert from outside a showing element would fight its attribute defense, so
// the bootstrap never touches them on an upgraded element.
// ---------------------------------------------------------------------------

export const BOOTSTRAP_JS =
  'function __bonesSwap(e,r){var t=document.querySelector(\'template[data-bones-chunk="\'+e+\'"]\'),n=document.querySelector(\'[data-bones-slot="\'+e+\'"]\');n?(t&&(n.replaceChildren(t.content),t.remove()),r&&n.setAttribute("data-bones-error",""),"boolean"==typeof n.busy?n.busy=!1:(n.removeAttribute("busy"),n.removeAttribute("aria-busy"),n.removeAttribute("inert"))):t&&t.remove()}';

export const BOOTSTRAP_SCRIPT = `<script>${BOOTSTRAP_JS}</script>`;
