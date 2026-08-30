import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { MovesPanel } from "./moves-panel";

afterEach(cleanup);

const moves = [
  {
    name: "tackle",
    url: "https://pokeapi.co/api/v2/move/33/",
    versionDetails: [{ levelLearnedAt: 1, learnMethod: "level-up", versionGroup: "red-blue" }],
  },
  {
    name: "vine-whip",
    url: "https://pokeapi.co/api/v2/move/22/",
    versionDetails: [{ levelLearnedAt: 7, learnMethod: "level-up", versionGroup: "red-blue" }],
  },
];

const moveDetails = {
  tackle: {
    name: "tackle",
    type: "normal",
    power: 40,
    accuracy: 100,
    pp: 35,
    damageClass: "physical",
    machineNumbers: {},
  },
  "vine-whip": {
    name: "vine-whip",
    type: "grass",
    power: 45,
    accuracy: 100,
    pp: 25,
    damageClass: "physical",
    machineNumbers: {},
  },
};

// MovesInteractive's loading layout: 25 game pills, 4 method tabs, and 10
// table rows.
const LOADING_ROWS = 10;

describe("MovesPanel", () => {
  test("renders the moves for the first game and method", () => {
    const { container } = render(<MovesPanel moves={moves} moveDetails={moveDetails} />);
    expect(screen.getByText("tackle")).toBeDefined();
    expect(screen.getByText("vine whip")).toBeDefined();
    expect(screen.getByText("red blue")).toBeDefined();
    expect(container.firstElementChild?.hasAttribute("aria-busy")).toBe(false);
  });

  test("renders the shell and sets aria-busy while nothing has loaded", () => {
    const { container } = render(<MovesPanel />);
    expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll("tbody tr").length).toBe(LOADING_ROWS);
    expect(container.querySelector("thead")?.getAttribute("data-bones-auto")).toBe("off");
  });

  test("stays busy while only the move details are pending", () => {
    const { container } = render(<MovesPanel moves={moves} />);
    expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText("tackle")).toBeDefined();
  });
});
