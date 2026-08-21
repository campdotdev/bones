import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { HeroSection } from "./hero-section";

afterEach(cleanup);

describe("HeroSection", () => {
  test("renders the Bones heading", () => {
    render(<HeroSection />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("bones");
  });

  test("renders the subtitle text", () => {
    render(<HeroSection />);
    expect(screen.getByText(/Skeleton loaders designed for React Server Components/)).toBeDefined();
  });

  test("renders docs and github links", () => {
    render(<HeroSection />);
    const docsLink = screen.getByRole("link", { name: "Docs" });
    const githubLink = screen.getByRole("link", { name: "GitHub" });
    expect(docsLink.getAttribute("href")).toBe("https://bones.lovo.sh");
    expect(githubLink.getAttribute("href")).toBe("https://github.com/campdotdev/bones");
  });
});
