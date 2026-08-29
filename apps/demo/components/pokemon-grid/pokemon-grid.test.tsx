import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { PokemonGrid } from "./pokemon-grid";

vi.mock("next/image", async () => (await import("@/test/mocks")).nextImageMockFactory());
vi.mock("next/link", async () => (await import("@/test/mocks")).nextLinkMockFactory());

afterEach(cleanup);

describe("PokemonGrid", () => {
  test("renders twelve card shells with no data and carries aria-busy on its root", () => {
    const { container } = render(<PokemonGrid aria-busy="true" />);
    expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
    // Every card renders an image with the "Pokemon" fallback alt text when
    // it has no data, so this counts how many of the 12 slots became cards.
    expect(container.querySelectorAll('img[alt="Pokemon"]').length).toBe(12);
    expect(container.textContent).toBe("");
  });

  test("renders one card per item with data", () => {
    const { container } = render(
      <PokemonGrid
        pokemon={[
          { id: 1, name: "bulbasaur", sprite: "https://example.com/1.png", types: ["grass"] },
          { id: 4, name: "charmander", sprite: "https://example.com/4.png", types: ["fire"] },
        ]}
      />,
    );
    expect(container.querySelectorAll("a").length).toBe(2);
    expect(container.firstElementChild?.hasAttribute("aria-busy")).toBe(false);
  });
});
