// next/image refuses an empty src. While a card has no data its image gets
// this transparent pixel; the stylesheet's block rule pushes whatever the
// image shows out of its box anyway, so the bone is what paints.
export const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
