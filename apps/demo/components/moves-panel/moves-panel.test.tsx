import { forceBones } from "@camp.dev/bones/react";
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
// table rows with seven cells each.
const LOADING_BONES = 25 + 4 + 10 * 7;

describe("MovesPanel", () => {
  test("renders the moves for the first game and method", () => {
    const { container } = render(<MovesPanel moves={moves} moveDetails={moveDetails} />);
    expect(screen.getByText("tackle")).toBeDefined();
    expect(screen.getByText("vine whip")).toBeDefined();
    expect(screen.getByText("red blue")).toBeDefined();
    expect(container.querySelectorAll("[data-bone]").length).toBe(0);
  });

  test("renders a full skeleton when both sources are forced", () => {
    const { container } = render(<MovesPanel moves={forceBones} moveDetails={forceBones} />);
    expect(container.querySelectorAll("[data-bone]").length).toBe(LOADING_BONES);
  });

  test("stays a skeleton while only the move details are pending", () => {
    const { container } = render(<MovesPanel moves={moves} moveDetails={forceBones} />);
    expect(screen.queryByText("tackle")).toBeNull();
    expect(container.querySelectorAll("[data-bone]").length).toBe(LOADING_BONES);
  });
});
