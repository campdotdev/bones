import { forceBones } from "@camp.dev/bones/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { StatBar } from "./stat-bar";

afterEach(cleanup);

describe("StatBar", () => {
  test("renders stat name and value", () => {
    render(<StatBar stat={{ name: "hp", value: 45 }} />);
    expect(screen.getByText("hp")).toBeDefined();
    expect(screen.getByText("45")).toBeDefined();
  });

  test("sets bar width to value / 255 as percentage", () => {
    const { container } = render(<StatBar stat={{ name: "attack", value: 255 }} />);
    const fill = container.querySelector("[style]") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  test("sets bar width to 0% when value is 0", () => {
    const { container } = render(<StatBar stat={{ name: "speed", value: 0 }} />);
    const fill = container.querySelector("[style]") as HTMLElement;
    expect(fill.style.width).toBe("0%");
  });

  test("defaults bar width to 60% when no stat provided", () => {
    const { container } = render(<StatBar />);
    const fill = container.querySelector("[style]") as HTMLElement;
    expect(fill.style.width).toBe("60%");
  });

  test("does not render stat text when no data provided", () => {
    const { container } = render(<StatBar />);
    const spans = container.querySelectorAll("span");
    for (const span of spans) {
      expect(span.textContent).toBe("");
    }
  });

  test("renders a full skeleton under forceBones", () => {
    const { container } = render(<StatBar stat={forceBones} />);
    // name, value, and bar
    expect(container.querySelectorAll("[data-bone]").length).toBe(3);
  });
});
