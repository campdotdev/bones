import { describe, expect, test } from "vite-plus/test";
import {
  fetchEncounters,
  fetchEvolutionChain,
  fetchMoveDetails,
  fetchPokemon,
  fetchPokemonList,
  fetchSpecies,
  fetchTypeDefenses,
} from "./pokeapi";

const GEN1_IDS = Array.from({ length: 151 }, (_, i) => String(i + 1));

describe("fetchPokemonList", () => {
  test("returns the first page in id order", async () => {
    const list = await fetchPokemonList(12);
    expect(list.map((p) => p.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(list[0]).toMatchObject({ id: 1, name: "bulbasaur", types: ["grass", "poison"] });
    expect(list[0].sprite).toMatch(/^https:\/\//);
  });

  test("honors limit and offset", async () => {
    const list = await fetchPokemonList(3, 24);
    expect(list.map((p) => p.name)).toEqual(["pikachu", "raichu", "sandshrew"]);
  });
});

describe("fetchPokemon", () => {
  test("returns pikachu with stats and moves", async () => {
    const p = await fetchPokemon("25");
    expect(p).toMatchObject({ id: 25, name: "pikachu", types: ["electric"] });
    expect(p.stats.map((s) => s.name)).toEqual([
      "hp",
      "attack",
      "defense",
      "special-attack",
      "special-defense",
      "speed",
    ]);
    expect(p.moves.length).toBeGreaterThan(50);
    expect(p.moves[0].url).toMatch(/\/move\/\d+\/$/);
    expect(p.moves[0].versionDetails[0]).toMatchObject({
      levelLearnedAt: expect.any(Number),
      learnMethod: expect.any(String),
      versionGroup: expect.any(String),
    });
  });

  test("rejects an id outside the snapshot", async () => {
    await expect(fetchPokemon("152")).rejects.toThrow(/152/);
  });
});

describe("fetchSpecies", () => {
  test("returns pikachu's species data", async () => {
    const s = await fetchSpecies("25");
    expect(s.genus).toBe("Mouse Pokémon");
    expect(s.generation).toBe("I");
    expect(s.evolutionChainUrl).toMatch(/\/evolution-chain\/\d+\/$/);
    expect(s.description.length).toBeGreaterThan(0);
    expect(s.flavorTextEntries[0]).toMatchObject({ text: expect.any(String), version: "red" });
  });
});

describe("fetchEvolutionChain", () => {
  test("flattens pikachu's chain into ordered stages", async () => {
    const species = await fetchSpecies("25");
    const chain = await fetchEvolutionChain(species.evolutionChainUrl);
    expect(chain.stages[0].map((s) => s.name)).toEqual(["pichu", "pikachu", "raichu"]);
    expect(chain.stages[0][1].trigger).toBe("Friendship");
    expect(chain.stages[0][2].trigger).toBe("Thunder Stone");
  });

  test("keeps branches for eevee", async () => {
    const species = await fetchSpecies("133");
    const chain = await fetchEvolutionChain(species.evolutionChainUrl);
    expect(chain.stages.length).toBeGreaterThan(3);
    for (const branch of chain.stages) expect(branch[0].name).toBe("eevee");
  });
});

describe("fetchTypeDefenses", () => {
  test("compounds dual-type multipliers for grass and poison", async () => {
    const defense = await fetchTypeDefenses(["grass", "poison"]);
    expect(defense.neutral).toContain("ground");
    expect(defense.resistantTo.find((r) => r.type === "grass")?.multiplier).toBe(0.25);
    expect(defense.weakTo.find((w) => w.type === "fire")?.multiplier).toBe(2);
  });

  test("reports immunities", async () => {
    const defense = await fetchTypeDefenses(["ghost"]);
    expect(defense.immuneTo).toEqual(expect.arrayContaining(["normal", "fighting"]));
  });
});

describe("fetchEncounters", () => {
  test("returns flattened encounter rows for pikachu", async () => {
    const encounters = await fetchEncounters("25");
    expect(encounters.length).toBeGreaterThan(0);
    expect(encounters[0]).toMatchObject({
      location: expect.any(String),
      version: expect.any(String),
      method: expect.any(String),
      minLevel: expect.any(Number),
      maxLevel: expect.any(Number),
      chance: expect.any(Number),
    });
    expect(encounters[0].location).not.toContain("-");
  });
});

describe("fetchMoveDetails", () => {
  test("resolves every move a pokemon references, keyed by name", async () => {
    const p = await fetchPokemon("25");
    const details = await fetchMoveDetails(p.moves.map((m) => m.url));
    for (const move of p.moves) expect(details[move.name]?.name).toBe(move.name);
    expect(details.thunderbolt).toMatchObject({
      type: "electric",
      power: 90,
      accuracy: 100,
      pp: 15,
      damageClass: "special",
    });
    expect(Object.values(details.thunderbolt.machineNumbers)).toContain("TM24");
  });
});

describe("snapshot coverage", () => {
  test("every gen 1 id resolves through every reader", async () => {
    for (const id of GEN1_IDS) {
      const [p, s, encounters] = await Promise.all([
        fetchPokemon(id),
        fetchSpecies(id),
        fetchEncounters(id),
      ]);
      expect(p.id).toBe(Number(id));
      expect(s.evolutionChainUrl).toBeTruthy();
      expect(Array.isArray(encounters)).toBe(true);
      const chain = await fetchEvolutionChain(s.evolutionChainUrl);
      expect(chain.stages.length).toBeGreaterThan(0);
      const details = await fetchMoveDetails(p.moves.map((m) => m.url));
      for (const move of p.moves) expect(details[move.name]).toBeDefined();
    }
  });
});
