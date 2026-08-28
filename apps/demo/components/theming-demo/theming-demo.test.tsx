import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { ThemingDemo } from "./theming-demo";

vi.mock("next/image", async () => (await import("@/test/mocks")).nextImageMockFactory());
vi.mock("next/link", async () => (await import("@/test/mocks")).nextLinkMockFactory());

afterEach(cleanup);

describe("ThemingDemo", () => {
  test("renders the section title", () => {
    render(<ThemingDemo />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Theming");
  });

  test("renders Warm, Cool, and Dark theme labels", () => {
    render(<ThemingDemo />);
    expect(screen.getByText("Warm")).toBeDefined();
    expect(screen.getByText("Cool")).toBeDefined();
    expect(screen.getByText("Dark")).toBeDefined();
  });

  test("renders three PokemonCard skeletons", () => {
    const { container } = render(<ThemingDemo />);
    const skeletons = container.querySelectorAll('img[alt="Pokemon"][data-bone]');
    expect(skeletons.length).toBe(3);
  });
});
