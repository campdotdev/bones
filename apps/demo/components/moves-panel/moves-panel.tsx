import type { ComponentProps } from "react";
import type { PokemonMoveEntry, MoveDetail } from "@/lib/pokeapi";
import { MovesInteractive } from "./moves-interactive";

interface MovesPanelProps extends ComponentProps<"div"> {
  moves?: PokemonMoveEntry[];
  moveDetails?: Record<string, MoveDetail>;
}

export function MovesPanel({ moves, moveDetails, ...rest }: MovesPanelProps) {
  return <MovesInteractive moves={moves} moveDetails={moveDetails} {...rest} />;
}
