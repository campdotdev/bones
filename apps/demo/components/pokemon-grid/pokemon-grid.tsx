import { createBones } from "@camp.dev/bones/react";
import { PokemonCard } from "@/components/pokemon-card/pokemon-card";
import type { PokemonListItem } from "@/lib/pokeapi";
import styles from "./styles.module.css";

export function PokemonGrid({
  pokemon,
}: {
  pokemon?: PokemonListItem[] | Promise<PokemonListItem[]>;
}) {
  const { repeat, data } = createBones(pokemon);

  return (
    <div className={styles.grid}>
      {repeat(data, 12, (item, i) => (
        <PokemonCard key={item?.id ?? i} pokemon={item} />
      ))}
    </div>
  );
}
