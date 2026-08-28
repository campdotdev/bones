import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { SuspenseDemo } from "./suspense-demo";

vi.mock("bones", async () => (await import("@/test/mocks")).bonesMockFactory());
vi.mock("next/link", async () => (await import("@/test/mocks")).nextLinkMockFactory());
vi.mock("@/lib/delay", () => ({
  delay: <T,>(value: T) => value,
}));
vi.mock("@/lib/pokeapi", () => ({
  fetchPokemonList: () => [
    { id: 1, name: "bulbasaur", sprite: "https://example.com/1.png", types: ["grass", "poison"] },
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
});
