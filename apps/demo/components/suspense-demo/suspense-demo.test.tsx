import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { SuspenseDemo } from "./suspense-demo";

vi.mock("next/image", async () => (await import("@/test/mocks")).nextImageMockFactory());
vi.mock("next/link", async () => (await import("@/test/mocks")).nextLinkMockFactory());
vi.mock("@/lib/delay", () => ({
  delay: <T,>(value: T) => value,
}));
const pokeapi = vi.hoisted(() => ({ pending: false }));
vi.mock("@/lib/pokeapi", () => ({
  fetchPokemonList: () =>
    pokeapi.pending
      ? new Promise(() => {})
      : [
          {
            id: 1,
            name: "bulbasaur",
            sprite: "https://example.com/1.png",
            types: ["grass", "poison"],
          },
          { id: 4, name: "charmander", sprite: "https://example.com/4.png", types: ["fire"] },
        ],
}));

afterEach(cleanup);

describe("SuspenseDemo", () => {
  test("renders the section title", () => {
    render(<SuspenseDemo />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Streaming with Suspense");
  });

  test("renders pokemon names", () => {
    render(<SuspenseDemo />);
    expect(screen.getByText("bulbasaur")).toBeDefined();
    expect(screen.getByText("charmander")).toBeDefined();
  });

  test("renders the fallback as twelve skeleton cards while the list is pending", () => {
    pokeapi.pending = true;
    try {
      const { container } = render(<SuspenseDemo />);
      expect(container.querySelectorAll('img[alt="Pokemon"][data-bone]').length).toBe(12);
    } finally {
      pokeapi.pending = false;
    }
  });
});
