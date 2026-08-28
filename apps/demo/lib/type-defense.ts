import type { TypeDefenseMap } from "./pokeapi-types";

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

export interface DamageRelations {
  double_damage_from: string[];
  half_damage_from: string[];
  no_damage_from: string[];
}

export function calculateTypeDefenses(damageRelations: DamageRelations[]): TypeDefenseMap {
  const multipliers: Record<string, number> = {};
  for (const t of ALL_TYPES) {
    multipliers[t] = 1;
  }

  for (const relations of damageRelations) {
    for (const t of relations.double_damage_from) {
      multipliers[t] *= 2;
    }
    for (const t of relations.half_damage_from) {
      multipliers[t] *= 0.5;
    }
    for (const t of relations.no_damage_from) {
      multipliers[t] *= 0;
    }
  }

  const weakTo: TypeDefenseMap["weakTo"] = [];
  const resistantTo: TypeDefenseMap["resistantTo"] = [];
  const neutral: string[] = [];
  const immuneTo: string[] = [];

  for (const [type, mult] of Object.entries(multipliers)) {
    if (mult === 0) immuneTo.push(type);
    else if (mult > 1) weakTo.push({ type, multiplier: mult });
    else if (mult < 1) resistantTo.push({ type, multiplier: mult });
    else neutral.push(type);
  }

  return { weakTo, resistantTo, neutral, immuneTo };
}
