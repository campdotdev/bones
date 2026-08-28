// Reads the PokeAPI snapshot under apps/demo/data/ instead of calling the
// network. Regenerate the snapshot with `node scripts/snapshot-pokeapi.mts`.
//
// Every reader is async and keeps the signature it had when it fetched live,
// so the pages can keep wrapping them in `delay()` for the streaming demos.
// The files are read with fs on first use, not imported, because the bundler
// would otherwise parse ~20 MB of JSON on every compile.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { calculateTypeDefenses, type DamageRelations } from "./type-defense";
import type {
  EncounterLocation,
  EvolutionChain,
  MoveDetail,
  PokemonData,
  PokemonListItem,
  SpeciesData,
  TypeDefenseMap,
} from "./pokeapi-types";

export type { PokemonListItem } from "./pokeapi-types";
export type {
  PokemonData,
  SpeciesData,
  EvolutionChain,
  TypeDefenseMap,
  MoveDetail,
  PokemonMoveEntry,
  EncounterLocation,
} from "./pokeapi-types";

export interface PokemonDetail {
  id: number;
  name: string;
  sprite: string;
  artwork: string;
  types: string[];
  height: number;
  weight: number;
  description: string;
  stats: { name: string; value: number }[];
}

const DATA_DIR = path.join(process.cwd(), "data");

const tables = new Map<string, Promise<Record<string, unknown>>>();

function loadTable<T>(file: string): Promise<Record<string, T>> {
  let table = tables.get(file);
  if (!table) {
    table = readFile(path.join(DATA_DIR, file), "utf8").then(
      (json) => JSON.parse(json) as Record<string, unknown>,
    );
    tables.set(file, table);
  }
  return table as Promise<Record<string, T>>;
}

async function lookup<T>(file: string, key: string, what: string): Promise<T> {
  const value = (await loadTable<T>(file))[key];
  if (value === undefined) {
    throw new Error(
      `${what} ${key} is not in the snapshot. Rerun scripts/snapshot-pokeapi.mts with a range that covers it.`,
    );
  }
  return value;
}

function idFromUrl(url: string): string {
  const parts = url.replace(/\/$/, "").split("/");
  return parts[parts.length - 1];
}

export async function fetchPokemonList(limit = 12, offset = 0): Promise<PokemonListItem[]> {
  const pokemon = await loadTable<PokemonData>("pokemon.json");
  return Object.values(pokemon)
    .sort((a, b) => a.id - b.id)
    .slice(offset, offset + limit)
    .map(({ id, name, sprite, types }) => ({ id, name, sprite, types }));
}

export async function fetchPokemon(id: string): Promise<PokemonData> {
  return lookup("pokemon.json", id, "Pokémon");
}

export async function fetchSpecies(id: string): Promise<SpeciesData> {
  return lookup("species.json", id, "Species");
}

export async function fetchEvolutionChain(url: string): Promise<EvolutionChain> {
  return lookup("evolution-chains.json", idFromUrl(url), "Evolution chain");
}

export async function fetchTypeDefenses(typeNames: string[]): Promise<TypeDefenseMap> {
  const relations = await Promise.all(
    typeNames.map((name) => lookup<DamageRelations>("types.json", name, "Type")),
  );
  return calculateTypeDefenses(relations);
}

export async function fetchEncounters(id: string): Promise<EncounterLocation[]> {
  return lookup("encounters.json", id, "Encounters for Pokémon");
}

export async function fetchMoveDetails(moveUrls: string[]): Promise<Record<string, MoveDetail>> {
  const result: Record<string, MoveDetail> = {};
  for (const url of new Set(moveUrls)) {
    const move = await lookup<MoveDetail>("moves.json", idFromUrl(url), "Move");
    result[move.name] = move;
  }
  return result;
}
