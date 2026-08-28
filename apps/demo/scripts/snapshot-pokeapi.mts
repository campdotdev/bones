// Fetches PokeAPI once and writes trimmed JSON under apps/demo/data/.
// The demo's lib/pokeapi.ts reads those files instead of calling the network.
//
//   node scripts/snapshot-pokeapi.mts            # Gen 1 (ids 1-151)
//   node scripts/snapshot-pokeapi.mts 1 151      # explicit id range
//
// Only the shapes in lib/pokeapi-types.ts are written, not the raw responses.
// Files are minified: lib/pokeapi.ts reads them with fs at runtime, and the
// pretty-printed form was three times the size.

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  EvolutionChain,
  EvolutionChainLink,
  EvolutionStage,
  EncounterLocation,
  MoveDetail,
  PokeAPIEncounterResponse,
  PokeAPIEvolutionChainResponse,
  PokeAPIMachineResponse,
  PokeAPIMoveResponse,
  PokeAPIPokemonResponse,
  PokeAPISpeciesResponse,
  PokeAPITypeResponse,
  PokemonData,
  SpeciesData,
} from "../lib/pokeapi-types.ts";
import type { DamageRelations } from "../lib/type-defense.ts";

const BASE = "https://pokeapi.co/api/v2";
const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const CONCURRENCY = 8;
const RETRIES = 6;

const ALL_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

// ---------------------------------------------------------------------------
// Fetching: retries with backoff, bounded concurrency
// ---------------------------------------------------------------------------

let requests = 0;

async function fetchJson<T>(url: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
      requests++;
      return (await res.json()) as T;
    } catch (error) {
      lastError = error;
      const wait = 500 * 2 ** attempt;
      console.warn(`retry ${attempt + 1}/${RETRIES} in ${wait}ms: ${url} (${String(error)})`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastError;
}

async function mapLimit<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  return results;
}

function idFromUrl(url: string): string {
  const parts = url.replace(/\/$/, "").split("/");
  return parts[parts.length - 1];
}

// ---------------------------------------------------------------------------
// Transforms: raw PokeAPI responses -> the app's types
// ---------------------------------------------------------------------------

function toPokemon(p: PokeAPIPokemonResponse): PokemonData {
  return {
    id: p.id,
    name: p.name,
    sprite: p.sprites.other["official-artwork"].front_default || p.sprites.front_default,
    artwork: p.sprites.other["official-artwork"].front_default,
    types: p.types.map((t) => t.type.name),
    height: p.height,
    weight: p.weight,
    baseExperience: p.base_experience,
    stats: p.stats.map((s) => ({ name: s.stat.name, value: s.base_stat, effort: s.effort })),
    moves: p.moves.map((m) => ({
      name: m.move.name,
      url: m.move.url,
      versionDetails: m.version_group_details.map((vgd) => ({
        levelLearnedAt: vgd.level_learned_at,
        learnMethod: vgd.move_learn_method.name,
        versionGroup: vgd.version_group.name,
      })),
    })),
  };
}

function toSpecies(s: PokeAPISpeciesResponse): SpeciesData {
  const genusEntry = s.genera.find((g) => g.language.name === "en");
  const englishFlavors = s.flavor_text_entries
    .filter((e) => e.language.name === "en")
    .map((e) => ({ text: e.flavor_text.replace(/[\f\n]/g, " "), version: e.version.name }));
  return {
    genderRate: s.gender_rate,
    captureRate: s.capture_rate,
    baseHappiness: s.base_happiness,
    hatchCounter: s.hatch_counter,
    growthRate: s.growth_rate.name,
    eggGroups: s.egg_groups.map((eg) => eg.name),
    genus: genusEntry ? genusEntry.genus : "",
    generation: s.generation.name.replace("generation-", "").toUpperCase(),
    habitat: s.habitat ? s.habitat.name : null,
    shape: s.shape ? s.shape.name : null,
    flavorTextEntries: englishFlavors,
    evolutionChainUrl: s.evolution_chain.url,
    description: englishFlavors.length > 0 ? englishFlavors[0].text : "",
  };
}

function titleCase(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatEvolutionTrigger(detail: EvolutionChainLink["evolution_details"][number]): string {
  if (!detail) return "";
  const trigger = detail.trigger.name;
  if (trigger === "level-up") {
    if (detail.min_level) return `Lv ${detail.min_level}`;
    if (detail.min_happiness) return "Friendship";
    if (detail.time_of_day) return `Lv up (${detail.time_of_day})`;
    return "Level up";
  }
  if (trigger === "use-item" && detail.item) return titleCase(detail.item.name);
  if (trigger === "trade") {
    return detail.held_item ? `Trade (${titleCase(detail.held_item.name)})` : "Trade";
  }
  return titleCase(trigger);
}

function flattenChain(link: EvolutionChainLink): EvolutionStage[][] {
  const speciesId = idFromUrl(link.species.url);
  const stage: EvolutionStage = {
    name: link.species.name,
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`,
    trigger:
      link.evolution_details.length > 0 ? formatEvolutionTrigger(link.evolution_details[0]) : "",
  };
  if (link.evolves_to.length === 0) return [[stage]];
  const branches: EvolutionStage[][] = [];
  for (const next of link.evolves_to) {
    for (const branch of flattenChain(next)) branches.push([stage, ...branch]);
  }
  return branches;
}

function toEvolutionChain(data: PokeAPIEvolutionChainResponse): EvolutionChain {
  return { stages: flattenChain(data.chain) };
}

function toDamageRelations(t: PokeAPITypeResponse): DamageRelations {
  return {
    double_damage_from: t.damage_relations.double_damage_from.map((x) => x.name),
    half_damage_from: t.damage_relations.half_damage_from.map((x) => x.name),
    no_damage_from: t.damage_relations.no_damage_from.map((x) => x.name),
  };
}

function toEncounters(data: PokeAPIEncounterResponse[]): EncounterLocation[] {
  const locations: EncounterLocation[] = [];
  for (const encounter of data) {
    const location = encounter.location_area.name.replace(/-/g, " ");
    for (const versionDetail of encounter.version_details) {
      for (const detail of versionDetail.encounter_details) {
        locations.push({
          location,
          version: versionDetail.version.name,
          method: detail.method.name,
          minLevel: detail.min_level,
          maxLevel: detail.max_level,
          chance: detail.chance,
        });
      }
    }
  }
  return locations;
}

function toMoveDetail(move: PokeAPIMoveResponse, machineItem: Map<string, string>): MoveDetail {
  const machineNumbers: Record<string, string> = {};
  for (const entry of move.machines) {
    const label = machineItem.get(entry.machine.url);
    if (label) machineNumbers[entry.version_group.name] = label;
  }
  return {
    name: move.name,
    type: move.type.name,
    power: move.power,
    accuracy: move.accuracy,
    pp: move.pp,
    damageClass: move.damage_class.name,
    machineNumbers,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const [fromArg, toArg] = process.argv.slice(2);
  const from = Number(fromArg ?? 1);
  const to = Number(toArg ?? 151);
  const ids = Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
  console.log(`snapshotting ids ${from}-${to} into ${OUT_DIR}`);

  const pokemon: Record<string, PokemonData> = {};
  const species: Record<string, SpeciesData> = {};
  const encounters: Record<string, EncounterLocation[]> = {};

  await mapLimit(ids, async (id) => {
    pokemon[id] = toPokemon(await fetchJson<PokeAPIPokemonResponse>(`${BASE}/pokemon/${id}`));
    species[id] = toSpecies(
      await fetchJson<PokeAPISpeciesResponse>(`${BASE}/pokemon-species/${id}`),
    );
    encounters[id] = toEncounters(
      await fetchJson<PokeAPIEncounterResponse[]>(`${BASE}/pokemon/${id}/encounters`),
    );
  });
  console.log(`pokemon, species, encounters: ${ids.length} each (${requests} requests so far)`);

  const chainUrls = [...new Set(Object.values(species).map((s) => s.evolutionChainUrl))];
  const evolutionChains: Record<string, EvolutionChain> = {};
  await mapLimit(chainUrls, async (url) => {
    evolutionChains[idFromUrl(url)] = toEvolutionChain(
      await fetchJson<PokeAPIEvolutionChainResponse>(url),
    );
  });
  console.log(`evolution chains: ${chainUrls.length}`);

  const types: Record<string, DamageRelations> = {};
  await mapLimit(ALL_TYPES, async (name) => {
    types[name] = toDamageRelations(await fetchJson<PokeAPITypeResponse>(`${BASE}/type/${name}`));
  });
  console.log(`types: ${ALL_TYPES.length}`);

  const moveUrls = [...new Set(Object.values(pokemon).flatMap((p) => p.moves.map((m) => m.url)))];
  const rawMoves = await mapLimit(moveUrls, (url) => fetchJson<PokeAPIMoveResponse>(url));
  const machineUrls = [...new Set(rawMoves.flatMap((m) => m.machines.map((x) => x.machine.url)))];
  const machineItem = new Map<string, string>();
  await mapLimit(machineUrls, async (url) => {
    const machine = await fetchJson<PokeAPIMachineResponse>(url);
    machineItem.set(url, machine.item.name.toUpperCase());
  });
  const moves: Record<string, MoveDetail> = {};
  rawMoves.forEach((move, i) => {
    moves[idFromUrl(moveUrls[i])] = toMoveDetail(move, machineItem);
  });
  console.log(`moves: ${moveUrls.length}, machines: ${machineUrls.length}`);

  await mkdir(OUT_DIR, { recursive: true });
  const files: Record<string, unknown> = {
    "pokemon.json": pokemon,
    "species.json": species,
    "encounters.json": encounters,
    "evolution-chains.json": evolutionChains,
    "types.json": types,
    "moves.json": moves,
  };
  for (const [name, value] of Object.entries(files)) {
    const json = JSON.stringify(value) + "\n";
    await writeFile(path.join(OUT_DIR, name), json);
    console.log(`wrote ${name} (${(json.length / 1024).toFixed(0)} KB)`);
  }
  console.log(`done: ${requests} requests`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
