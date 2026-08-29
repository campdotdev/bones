import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { fetchPokemonList } from "@/lib/pokeapi";
import { ForcedSkeletonsDemo } from "./forced-skeletons-demo";

vi.mock("next/link", async () => (await import("@/test/mocks")).nextLinkMockFactory());
vi.mock("@/lib/pokeapi", () => ({
  fetchPokemonList: vi.fn(() =>
    Promise.resolve([
      { id: 1, name: "bulbasaur", sprite: "https://example.com/1.png", types: ["grass", "poison"] },
    ]),
  ),
}));

afterEach(cleanup);

describe("ForcedSkeletonsDemo", () => {
  test("renders the section title", async () => {
    const Component = await ForcedSkeletonsDemo();
    render(Component);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Forced Skeletons");
  });

  test("renders the toggle button", async () => {
    const Component = await ForcedSkeletonsDemo();
    render(Component);
    expect(screen.getByRole("button", { name: "Force Skeletons" })).toBeDefined();
  });

  test("renders pokemon names", async () => {
    const Component = await ForcedSkeletonsDemo();
    render(Component);
    expect(screen.getByText("bulbasaur")).toBeDefined();
  });

  test("forcing skeletons renders twelve skeleton cards", async () => {
    vi.mocked(fetchPokemonList).mockResolvedValueOnce(
      Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `pokemon-${i + 1}`,
        sprite: `https://example.com/${i + 1}.png`,
        types: ["grass", "poison"],
      })),
    );
    const Component = await ForcedSkeletonsDemo();
    const { container } = render(Component);
    fireEvent.click(screen.getByRole("button", { name: "Force Skeletons" }));
    expect(screen.queryByText("bulbasaur")).toBeNull();
    expect(container.querySelectorAll('[aria-busy="true"] img').length).toBe(12);
  });
});
