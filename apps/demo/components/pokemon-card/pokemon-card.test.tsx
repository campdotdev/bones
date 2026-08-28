import { forceBones } from "@camp.dev/bones/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { PokemonCard } from "./pokemon-card";

vi.mock("next/image", async () => (await import("@/test/mocks")).nextImageMockFactory());
vi.mock("next/link", async () => (await import("@/test/mocks")).nextLinkMockFactory());

afterEach(cleanup);

const pokemon = {
  id: 25,
  name: "pikachu",
  sprite: "https://example.com/pikachu.png",
  types: ["electric"],
};

describe("PokemonCard", () => {
  test("renders pokemon name and image", () => {
    render(<PokemonCard pokemon={pokemon} />);
    expect(screen.getByText("pikachu")).toBeDefined();
    expect(screen.getByAltText("pikachu")).toBeDefined();
  });

  test("wraps card in link when pokemon is provided", () => {
    const { container } = render(<PokemonCard pokemon={pokemon} />);
    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toBe("/pokemon/25");
  });

  test("does not wrap in link when pokemon is undefined", () => {
    const { container } = render(<PokemonCard />);
    expect(container.querySelector("a")).toBeNull();
  });

  test("renders type badges", () => {
    render(<PokemonCard pokemon={{ ...pokemon, types: ["electric", "steel"] }} />);
    expect(screen.getByText("electric")).toBeDefined();
    expect(screen.getByText("steel")).toBeDefined();
  });

  test("uses pokemon name as image alt text", () => {
    render(<PokemonCard pokemon={pokemon} />);
    const img = screen.getByAltText("pikachu") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/pikachu.png");
  });

  test("falls back to 'Pokemon' alt text when no data", () => {
    render(<PokemonCard />);
    expect(screen.getByAltText("Pokemon")).toBeDefined();
  });

  test("renders a full skeleton under forceBones", () => {
    const { container } = render(<PokemonCard pokemon={forceBones} />);
    // image, name, and two type badges
    expect(container.querySelectorAll("[data-bone]").length).toBe(4);
    expect(container.querySelector("a")).toBeNull();
    expect(container.textContent).toBe("");
  });
});
