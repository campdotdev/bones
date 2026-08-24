import { afterEach, expect, test } from "vite-plus/test";
import { measureBones, TEXT_BAR_SCALE } from "../../src/element/measure.ts";

// ---------------------------------------------------------------------------
// The DOM walk against a real layout engine. Fixtures use monospace with
// ch-based widths so line wrapping is deterministic on any platform.
// ---------------------------------------------------------------------------

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(html: string): HTMLElement {
  const root = document.createElement("div");
  root.style.cssText =
    "width: 20ch; font: 16px/1.5 monospace; position: absolute; top: 0; left: 0;";
  root.innerHTML = html;
  document.body.append(root);
  return root;
}

test("one text bone per rendered line", () => {
  // 4-char words in a 20ch container: "aaaa bbbb cccc dddd" (19ch) fits line
  // one, "eeee ffff" wraps to line two.
  const root = mount('<p style="margin: 0">aaaa bbbb cccc dddd eeee ffff</p>');
  const bones = measureBones(root);
  expect(bones).toHaveLength(2);
  expect(bones.every((bone) => bone.kind === "text")).toBe(true);
  const [first, second] = bones;
  expect(second.top).toBeGreaterThan(first.top);
  expect(first.width).toBeGreaterThan(second.width);
});

test("text bars shrink to TEXT_BAR_SCALE of the line box, centered", () => {
  const root = mount('<p style="margin: 0">aaaa</p>');
  const text = root.querySelector("p")!.firstChild as Text;
  const range = document.createRange();
  range.selectNodeContents(text);
  const line = range.getClientRects()[0];
  const [bone] = measureBones(root);
  expect(bone.height).toBeCloseTo(line.height * TEXT_BAR_SCALE, 0);
  expect(bone.top + bone.height / 2).toBeCloseTo(line.top + line.height / 2, 0);
  expect(bone.left).toBeCloseTo(line.left, 0);
  expect(bone.width).toBeCloseTo(line.width, 0);
});

test("inline fragments on one line yield one bar", () => {
  const root = mount('<p style="margin: 0">aaaa <strong>bbbb</strong> cccc</p>');
  expect(measureBones(root)).toHaveLength(1);
});

test("replaced elements and form controls become block bones, atomically", () => {
  const root = mount(
    '<img alt="" style="display: block; width: 48px; height: 48px" /><button type="button">Go</button>',
  );
  const bones = measureBones(root);
  expect(bones.filter((bone) => bone.kind === "block")).toHaveLength(2);
  // The button's text node must not also produce a text bone.
  expect(bones.filter((bone) => bone.kind === "text")).toHaveLength(0);
  const img = root.querySelector("img")!.getBoundingClientRect();
  const imgBone = bones.find((bone) => Math.abs(bone.height - 48) < 1)!;
  expect(imgBone.left).toBeCloseTo(img.left, 0);
  expect(imgBone.width).toBeCloseTo(img.width, 0);
});

test("data-bones-auto off subtrees are skipped", () => {
  const root = mount(
    '<p style="margin: 0">aaaa</p><div data-bones-auto="off"><p>live region</p></div>',
  );
  expect(measureBones(root)).toHaveLength(1);
});

test("whitespace-only and display:none content yields nothing", () => {
  const root = mount('<p style="display: none">hidden</p><p>   </p>');
  expect(measureBones(root)).toEqual([]);
});
