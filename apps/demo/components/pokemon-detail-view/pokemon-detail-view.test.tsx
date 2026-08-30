import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { PokemonDetailView } from "./pokemon-detail-view";

vi.mock("next/image", async () => (await import("@/test/mocks")).nextImageMockFactory());

afterEach(cleanup);

const pokemon = {
  id: 25,
  name: "pikachu",
  sprite: "https://example.com/pikachu.png",
  artwork: "https://example.com/pikachu-art.png",
  types: ["electric"],
  height: 4,
  weight: 60,
  description:
    "When several of these Pokémon gather, their electricity can cause lightning storms.",
  stats: [
    { name: "hp", value: 35 },
    { name: "attack", value: 55 },
  ],
};

describe("PokemonDetailView", () => {
  test("renders pokemon name and artwork", () => {
    render(<PokemonDetailView pokemon={pokemon} />);
    expect(screen.getByText("pikachu")).toBeDefined();
    const img = screen.getByAltText("pikachu") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/pikachu-art.png");
  });

  test("formats height in meters (divides by 10)", () => {
    render(<PokemonDetailView pokemon={pokemon} />);
    expect(screen.getByText("0.4 m")).toBeDefined();
  });

  test("formats weight in kilograms (divides by 10)", () => {
    render(<PokemonDetailView pokemon={pokemon} />);
    expect(screen.getByText("6 kg")).toBeDefined();
  });

  test("renders description text", () => {
    render(<PokemonDetailView pokemon={pokemon} />);
    expect(screen.getByText(pokemon.description)).toBeDefined();
  });

  test("renders type badges", () => {
    render(<PokemonDetailView pokemon={{ ...pokemon, types: ["electric", "flying"] }} />);
    expect(screen.getByText("electric")).toBeDefined();
    expect(screen.getByText("flying")).toBeDefined();
  });

  test("renders stat bars for each stat", () => {
    render(<PokemonDetailView pokemon={pokemon} />);
    expect(screen.getByText("hp")).toBeDefined();
    expect(screen.getByText("attack")).toBeDefined();
    expect(screen.getByText("35")).toBeDefined();
    expect(screen.getByText("55")).toBeDefined();
  });

  test("renders section headings", () => {
    render(<PokemonDetailView pokemon={pokemon} />);
    expect(screen.getByText("Description")).toBeDefined();
    expect(screen.getByText("Base Stats")).toBeDefined();
  });

  test("renders skeleton state when no pokemon provided", () => {
    const { container } = render(<PokemonDetailView />);
    expect(container.querySelector("h1")?.textContent).toBe("");
    expect(container.querySelector("p")?.getAttribute("data-bones-lines")).toBe("3");
  });

  test("renders six stat rows and a three-line description with no data", () => {
    const { container } = render(<PokemonDetailView aria-busy="true" />);
    expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
    const stats = screen.getByRole("heading", { name: "Base Stats" }).closest("section");
    expect(stats?.querySelectorAll("[data-bones-type='block']").length).toBe(6);
    expect(container.querySelector("[data-bones-lines='3']")).not.toBeNull();
    expect(container.querySelectorAll("h2[data-bones-auto='off']").length).toBe(2);
  });
});
