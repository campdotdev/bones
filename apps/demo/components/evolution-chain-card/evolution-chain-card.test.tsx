import { forceBones } from "@camp.dev/bones/react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { EvolutionChainCard } from "./evolution-chain-card";

afterEach(cleanup);

describe("EvolutionChainCard", () => {
  test("renders linear chain stages", () => {
    const chain = {
      stages: [
        [
          { name: "bulbasaur", spriteUrl: "https://example.com/1.png", trigger: "" },
          { name: "ivysaur", spriteUrl: "https://example.com/2.png", trigger: "Lv 16" },
          { name: "venusaur", spriteUrl: "https://example.com/3.png", trigger: "Lv 32" },
        ],
      ],
    };
    render(<EvolutionChainCard chain={chain} currentName="bulbasaur" />);
    expect(screen.getByText("bulbasaur")).toBeDefined();
    expect(screen.getByText("ivysaur")).toBeDefined();
    expect(screen.getByText("venusaur")).toBeDefined();
    expect(screen.getByText("Lv 16")).toBeDefined();
    expect(screen.getByText("Lv 32")).toBeDefined();
  });

  test("highlights current pokemon", () => {
    const chain = {
      stages: [
        [
          { name: "bulbasaur", spriteUrl: "", trigger: "" },
          { name: "ivysaur", spriteUrl: "", trigger: "Lv 16" },
        ],
      ],
    };
    const { container } = render(<EvolutionChainCard chain={chain} currentName="bulbasaur" />);
    const current = container.querySelector("[data-current='true']");
    expect(current?.textContent).toContain("bulbasaur");
  });

  test("renders single-stage pokemon without arrows", () => {
    const chain = {
      stages: [[{ name: "ditto", spriteUrl: "", trigger: "" }]],
    };
    render(<EvolutionChainCard chain={chain} currentName="ditto" />);
    expect(screen.getByText("ditto")).toBeDefined();
    expect(screen.queryByText("→")).toBeNull();
  });

  test("renders a three-stage skeleton under forceBones", () => {
    const { container } = render(<EvolutionChainCard chain={forceBones} />);
    expect(screen.getAllByText("→").length).toBe(2);
    // a sprite and a name for each of three stages, plus two triggers
    expect(container.querySelectorAll("[data-bone]").length).toBe(8);
  });
});
