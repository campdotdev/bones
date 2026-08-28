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

  test("renders the forced preview as four skeleton lines", () => {
    const { container } = render(<MultiLineTextDemo />);
    expect(container.querySelectorAll("[data-bone-line]").length).toBe(4);
  });
});
