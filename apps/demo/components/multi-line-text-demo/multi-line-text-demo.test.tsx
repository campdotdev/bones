import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { MultiLineTextDemo } from "./multi-line-text-demo";

afterEach(cleanup);

describe("MultiLineTextDemo", () => {
  test("renders the section title", () => {
    render(<MultiLineTextDemo />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("Multi-Line Text");
  });

  test("renders the article with content", () => {
    render(<MultiLineTextDemo />);
    expect(screen.getByText("Understanding React Server Components")).toBeDefined();
  });

  test("renders two article previews", () => {
    const { container } = render(<MultiLineTextDemo />);
    const headings = container.querySelectorAll("h3");
    expect(headings.length).toBe(2);
  });

  test("renders the busy preview with a four-line excerpt", () => {
    const { container } = render(<MultiLineTextDemo />);
    expect(container.querySelector('[aria-busy="true"] [data-bones-lines="4"]')).not.toBeNull();
  });
});
