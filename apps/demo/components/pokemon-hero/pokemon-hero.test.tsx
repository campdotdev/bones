import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { PokemonHero } from "./pokemon-hero";

vi.mock("next/image", async () => (await import("@/test/mocks")).nextImageMockFactory());

afterEach(cleanup);

const pokemon = {
  id: 1,
  name: "bulbasaur",
  sprite: "https://example.com/bulbasaur.png",
  artwork: "https://example.com/bulbasaur-art.png",
  types: ["grass", "poison"],
  height: 7,
  weight: 69,
  baseExperience: 64,
  stats: [],
  moves: [],
};

const species = {
  genderRate: 1,
  captureRate: 45,
  baseHappiness: 50,
  hatchCounter: 20,
  growthRate: "medium-slow",
  eggGroups: ["monster", "grass"],
  genus: "Seed Pokémon",
  generation: "I",
  habitat: "grassland",
  shape: "quadruped",
  flavorTextEntries: [],
  evolutionChainUrl: "",
  description: "A strange seed was planted on its back at birth.",
};

describe("PokemonHero", () => {
  test("renders pokemon name and number", () => {
    render(<PokemonHero pokemon={pokemon} species={species} />);
    expect(screen.getByText("bulbasaur")).toBeDefined();
    expect(screen.getByText("#001")).toBeDefined();
  });

  test("renders artwork image", () => {
    render(<PokemonHero pokemon={pokemon} species={species} />);
    const img = screen.getByAltText("bulbasaur") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/bulbasaur-art.png");
  });

  test("renders type badges", () => {
    render(<PokemonHero pokemon={pokemon} species={species} />);
    expect(screen.getByText("grass")).toBeDefined();
    expect(screen.getByText("poison")).toBeDefined();
  });

  test("formats height and weight", () => {
    render(<PokemonHero pokemon={pokemon} species={species} />);
    expect(screen.getByText(/0\.7 m/)).toBeDefined();
    expect(screen.getByText(/6\.9 kg/)).toBeDefined();
  });

  test("renders species genus", () => {
    render(<PokemonHero pokemon={pokemon} species={species} />);
    expect(screen.getByText(/Seed Pokémon/)).toBeDefined();
  });

  test("renders description", () => {
    render(<PokemonHero pokemon={pokemon} species={species} />);
    expect(screen.getByText(species.description)).toBeDefined();
  });

  test("renders the shell with no data", () => {
    const { container } = render(<PokemonHero aria-busy="true" />);
    expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector("h1")?.textContent).toBe("");
    // name, number, two type badges
    expect(container.querySelectorAll("span").length).toBe(4);
    expect(container.querySelector("[data-bones-lines='2']")).not.toBeNull();
    expect((screen.getByAltText("Pokemon") as HTMLImageElement).src.startsWith("data:")).toBe(true);
  });
});
