import { boneAttributes, minMax } from "@camp.dev/bones";
import "@camp.dev/bones/css";

import { applyBone, clearBone } from "./apply.ts";

const AVATAR =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><circle cx="36" cy="36" r="36" fill="#7c9a72"/><circle cx="36" cy="28" r="12" fill="#f3efe4"/><ellipse cx="36" cy="58" rx="20" ry="14" fill="#f3efe4"/></svg>`,
  );

const profile = {
  avatar: AVATAR,
  name: "Sasha Greenfield",
  role: "Field recordist",
  bio: "Collects tape loops, birdsong, and the hum of old refrigerators.",
};

const avatar = document.querySelector("img")!;
const fields = ["name", "role", "bio"] as const;
const text = fields.map((id, index) => ({
  el: document.getElementById(id)!,
  attrs: boneAttributes("text", { length: minMax(12, 32) }, index),
}));

let loading = true;

function render() {
  if (loading) {
    applyBone(avatar, boneAttributes("block"));
    for (const { el, attrs } of text) {
      el.textContent = "";
      applyBone(el, attrs);
    }
  } else {
    clearBone(avatar);
    avatar.src = profile.avatar;
    for (const [index, { el }] of text.entries()) {
      clearBone(el);
      el.textContent = profile[fields[index]];
    }
  }
}

document.getElementById("toggle")!.addEventListener("click", () => {
  loading = !loading;
  render();
});

render();
