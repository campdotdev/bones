import "@camp.dev/bones/css";

import { busy } from "./apply.ts";

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
const reload = document.querySelector<HTMLButtonElement>("#reload")!;
const speed = document.querySelector<HTMLSelectElement>("#speed")!;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fill(): void {
  avatar.src = profile.avatar;
  for (const id of fields) document.getElementById(id)!.textContent = profile[id];
}

// The old content stays on screen while the request runs. If bones show,
// they are sized from it; if the response beats `delay`, nothing flashes.
async function load(): Promise<void> {
  reload.disabled = true;
  const done = busy(card);
  await sleep(Number(speed.value));
  fill();
  done();
  reload.disabled = false;
}

reload.addEventListener("click", () => void load());
void load();
