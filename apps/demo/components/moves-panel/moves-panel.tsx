import { createBones } from "bones/react";
import type { PokemonMoveEntry, MoveDetail } from "@/lib/pokeapi";
import { MovesInteractive } from "./moves-interactive";

interface MovesPanelProps {
  moves?: PokemonMoveEntry[] | Promise<PokemonMoveEntry[]>;
  moveDetails?: Record<string, MoveDetail> | Promise<Record<string, MoveDetail>>;
}

export function MovesPanel({ moves, moveDetails }: MovesPanelProps) {
  const { data: movesData } = createBones(moves);
  const { data: detailsData } = createBones(moveDetails);
  return <MovesInteractive moves={movesData ?? undefined} moveDetails={detailsData ?? undefined} />;
}
