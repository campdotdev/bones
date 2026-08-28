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

  test("renders three PokemonCard skeletons", () => {
    const { container } = render(<AnimationsDemo />);
    const skeletons = container.querySelectorAll('img[alt="Pokemon"][data-bone]');
    expect(skeletons.length).toBe(3);
  });

  test("applies correct data-bone-animate values", () => {
    const { container } = render(<AnimationsDemo />);
    const demos = container.querySelectorAll("[data-bone-animate]");
    const values = Array.from(demos).map((el) => el.getAttribute("data-bone-animate"));
    expect(values).toEqual(["none", "shimmer", "pulse"]);
  });
});
