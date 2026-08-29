import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { DexEntriesPanel } from "./dex-entries-panel";

afterEach(cleanup);

const entries = [
  { text: "A strange seed was planted on its back at birth.", version: "red" },
  { text: "A strange seed was planted on its back at birth.", version: "blue" },
  { text: "It can go for days without eating a single morsel.", version: "gold" },
];

describe("DexEntriesPanel", () => {
  test("groups entries by generation", () => {
    render(<DexEntriesPanel entries={entries} />);
    expect(screen.getByText("Generation I")).toBeDefined();
    expect(screen.getByText("Generation II")).toBeDefined();
    expect(screen.getByText("red")).toBeDefined();
    expect(screen.getByText("gold")).toBeDefined();
  });

  test("renders three placeholder generations with three empty entries each", () => {
    const { container } = render(<DexEntriesPanel aria-busy="true" />);
    expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll("span").length).toBe(3 + 9 * 2);
    expect(container.textContent).toBe("");
  });
});
