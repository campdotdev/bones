import type { ComponentProps } from "react";
import { PokemonCard } from "@/components/pokemon-card/pokemon-card";
import type { PokemonListItem } from "@/lib/pokeapi";
import styles from "./styles.module.css";

export function PokemonGrid({
  pokemon,
  ...rest
}: { pokemon?: PokemonListItem[] } & ComponentProps<"div">) {
  return (
    <div className={styles.grid} {...rest}>
      {(pokemon ?? Array.from({ length: 12 })).map((item, i) => (
        <PokemonCard key={item?.id ?? i} pokemon={item} />
      ))}
    </div>
  );
}
