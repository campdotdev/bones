import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { AnimationsDemo } from "./animations-demo";

vi.mock("next/image", async () => (await import("@/test/mocks")).nextImageMockFactory());
vi.mock("next/link", async () => (await import("@/test/mocks")).nextLinkMockFactory());

afterEach(cleanup);

describe("AnimationsDemo", () => {
  test("renders the section title", () => {
    render(<AnimationsDemo />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Animations");
  });

  test("renders Static, Shimmer, and Pulse labels", () => {
    render(<AnimationsDemo />);
    expect(screen.getByText("Static")).toBeDefined();
    expect(screen.getByText("Shimmer")).toBeDefined();
    expect(screen.getByText("Pulse")).toBeDefined();
  });

  test("renders three busy PokemonCard shells", () => {
    const { container } = render(<AnimationsDemo />);
    expect(container.querySelectorAll('[aria-busy="true"] img[alt="Pokemon"]').length).toBe(3);
  });

  test("applies the three data-bones-animate values", () => {
    const { container } = render(<AnimationsDemo />);
    const values = [...container.querySelectorAll("[data-bones-animate]")].map((el) =>
      el.getAttribute("data-bones-animate"),
    );
    expect(values).toEqual(["none", "shimmer", "pulse"]);
  });
});
