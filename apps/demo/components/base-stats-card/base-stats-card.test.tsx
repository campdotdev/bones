import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { BaseStatsCard } from "./base-stats-card";

afterEach(cleanup);

const pokemon = {
  id: 1,
  name: "bulbasaur",
  sprite: "",
  artwork: "",
  types: [],
  height: 7,
  weight: 69,
  baseExperience: 64,
  stats: [
    { name: "hp", value: 45, effort: 0 },
    { name: "attack", value: 49, effort: 0 },
    { name: "defense", value: 49, effort: 0 },
    { name: "special-attack", value: 65, effort: 1 },
    { name: "special-defense", value: 65, effort: 0 },
    { name: "speed", value: 45, effort: 0 },
  ],
  moves: [],
};

describe("BaseStatsCard", () => {
  test("renders all 6 stat names", () => {
    render(<BaseStatsCard pokemon={pokemon} />);
    expect(screen.getByText("HP")).toBeDefined();
    expect(screen.getByText("Attack")).toBeDefined();
    expect(screen.getByText("Defense")).toBeDefined();
    expect(screen.getByText("Sp. Attack")).toBeDefined();
    expect(screen.getByText("Sp. Defense")).toBeDefined();
    expect(screen.getByText("Speed")).toBeDefined();
  });

  test("renders stat values", () => {
    render(<BaseStatsCard pokemon={pokemon} />);
    expect(screen.getAllByText("45").length).toBe(2); // hp and speed
    expect(screen.getAllByText("49").length).toBe(2); // attack and defense
    expect(screen.getAllByText("65").length).toBe(2); // sp. attack and sp. defense
  });

  test("renders total", () => {
    render(<BaseStatsCard pokemon={pokemon} />);
    expect(screen.getByText("318")).toBeDefined();
  });

  test("with no data: six block fills, empty values, readable labels", () => {
    const { container } = render(<BaseStatsCard aria-busy="true" />);
    expect(container.querySelectorAll("[data-bones-type='block']").length).toBe(6);
    expect(container.querySelectorAll("[data-bones-auto='off']").length).toBe(8);
    expect(screen.getByText("HP")).toBeDefined();
    expect(screen.getByText("Total").nextElementSibling?.textContent).toBe("");
  });
});
