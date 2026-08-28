import { forceBones } from "@camp.dev/bones/react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { PokemonGrid } from "./pokemon-grid";

vi.mock("next/image", async () => (await import("@/test/mocks")).nextImageMockFactory());
vi.mock("next/link", async () => (await import("@/test/mocks")).nextLinkMockFactory());

afterEach(cleanup);

describe("PokemonGrid", () => {
  test("forwards forceBones to cards so the whole grid renders skeletons", () => {
    const { container } = render(<PokemonGrid pokemon={forceBones} />);
    // Every card renders an image with the "Pokemon" fallback alt text when
    // it has no data, so this counts how many of the 12 slots became cards.
    expect(container.querySelectorAll('img[alt="Pokemon"]').length).toBe(12);
    expect(container.querySelectorAll("[data-bone]").length).toBeGreaterThan(0);
  });
});
