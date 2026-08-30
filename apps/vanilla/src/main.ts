import "@camp.dev/bones/css";

import { setLoading } from "./apply.ts";

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

const card = document.querySelector<HTMLElement>(".card")!;
const avatar = card.querySelector("img")!;
const fields = ["name", "role", "bio"] as const;

let loading = true;

function render() {
  setLoading(card, loading);
  if (loading) {
    avatar.removeAttribute("src");
    for (const id of fields) document.getElementById(id)!.textContent = "";
  } else {
    avatar.src = profile.avatar;
    for (const id of fields) document.getElementById(id)!.textContent = profile[id];
  }
}

document.getElementById("toggle")!.addEventListener("click", () => {
  loading = !loading;
  render();
});

render();
