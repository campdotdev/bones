import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { TypeDefenseCard } from "./type-defense-card";

afterEach(cleanup);

const typeDefense = {
  weakTo: [
    { type: "fire", multiplier: 2 },
    { type: "psychic", multiplier: 2 },
  ],
  resistantTo: [
    { type: "water", multiplier: 0.5 },
    { type: "grass", multiplier: 0.25 },
  ],
  neutral: ["normal", "rock"],
  immuneTo: [],
};

describe("TypeDefenseCard", () => {
  test("renders weak to types with multipliers", () => {
    render(<TypeDefenseCard typeDefense={typeDefense} />);
    expect(screen.getAllByText(/fire/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2x/).length).toBeGreaterThan(0);
  });

  test("renders resistant to types", () => {
    render(<TypeDefenseCard typeDefense={typeDefense} />);
    expect(screen.getByText(/water/i)).toBeDefined();
  });

  test("renders neutral types", () => {
    render(<TypeDefenseCard typeDefense={typeDefense} />);
    expect(screen.getByText(/normal/i)).toBeDefined();
    expect(screen.getByText(/rock/i)).toBeDefined();
  });

  test("renders immune section when applicable", () => {
    const withImmunity = {
      ...typeDefense,
      immuneTo: ["ghost"],
    };
    render(<TypeDefenseCard typeDefense={withImmunity} />);
    expect(screen.getByText(/ghost/i)).toBeDefined();
    expect(screen.getByText("Immune to")).toBeDefined();
  });

  test("renders three placeholder groups with twelve empty pills and readable labels", () => {
    const { container } = render(<TypeDefenseCard aria-busy="true" />);
    expect(screen.getByText("Weak to")).toBeDefined();
    expect(screen.getByText("Resistant to")).toBeDefined();
    expect(screen.getByText("Neutral")).toBeDefined();
    const pills = container.querySelectorAll("span:not([data-bones-auto])");
    expect(pills.length).toBe(12);
    for (const pill of pills) expect(pill.textContent).toBe("");
  });
});
