import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { InfoCard } from "./info-card";

afterEach(cleanup);

describe("InfoCard", () => {
  test("renders label and key-value rows", () => {
    const rows = [
      { label: "Catch Rate", value: "45" },
      { label: "Base Exp", value: "64" },
    ];
    render(<InfoCard title="Training" labels={["Catch Rate", "Base Exp"]} rows={rows} />);
    expect(screen.getByText("Training")).toBeDefined();
    expect(screen.getByText("Catch Rate")).toBeDefined();
    expect(screen.getByText("45")).toBeDefined();
    expect(screen.getByText("Base Exp")).toBeDefined();
    expect(screen.getByText("64")).toBeDefined();
  });

  test("renders an empty value for every label with no data, and keeps labels readable", () => {
    const { container } = render(
      <InfoCard title="Training" labels={["Catch Rate", "Base Exp"]} aria-busy="true" />,
    );
    expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText("Training").getAttribute("data-bones-auto")).toBe("off");
    expect(screen.getByText("Catch Rate").getAttribute("data-bones-auto")).toBe("off");
    const values = container.querySelectorAll("span:not([data-bones-auto])");
    expect(values.length).toBe(2);
    for (const value of values) expect(value.textContent).toBe("");
  });
});
