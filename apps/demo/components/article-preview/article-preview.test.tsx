import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { ArticlePreview } from "./article-preview";

afterEach(cleanup);

const article = {
  title: "Getting Started with React",
  excerpt: "A guide to building modern UIs",
  author: "Jane Doe",
  date: "2024-01-15",
};

describe("ArticlePreview", () => {
  test("renders title, excerpt, author, and date", () => {
    render(<ArticlePreview article={article} />);
    expect(screen.getByText("Getting Started with React")).toBeDefined();
    expect(screen.getByText("A guide to building modern UIs")).toBeDefined();
    expect(screen.getByText("Jane Doe")).toBeDefined();
    expect(screen.getByText("2024-01-15")).toBeDefined();
  });

  test("renders middot separator between author and date", () => {
    const { container } = render(<ArticlePreview article={article} />);
    expect(container.textContent).toContain("\u00b7");
  });

  test("renders empty content when no article provided", () => {
    const { container } = render(<ArticlePreview />);
    const heading = container.querySelector("h3");
    expect(heading).not.toBeNull();
    expect(heading?.textContent).toBe("");
  });

  test("marks the excerpt as four lines and keeps the dot readable", () => {
    const { container } = render(<ArticlePreview aria-busy="true" />);
    expect(container.querySelector("p")?.getAttribute("data-bones-lines")).toBe("4");
    expect(container.querySelector("[data-bones-auto='off']")?.textContent).toBe("·");
    expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
  });
});
