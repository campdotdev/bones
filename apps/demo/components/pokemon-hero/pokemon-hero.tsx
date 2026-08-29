import Image from "next/image";
import type { ComponentProps } from "react";
import type { PokemonData, SpeciesData } from "@/lib/pokeapi";
import { TRANSPARENT_PIXEL } from "@/lib/pixel";
import { TypeBadge } from "@/components/type-badge/type-badge";
import styles from "./styles.module.css";

export function PokemonHero({
  pokemon,
  species,
  ...rest
}: { pokemon?: PokemonData; species?: SpeciesData } & ComponentProps<"div">) {
  return (
    <div className={styles.hero} {...rest}>
      <div className={styles.imageBox}>
        <Image
          className={styles.artwork}
          src={pokemon?.artwork ?? TRANSPARENT_PIXEL}
          alt={pokemon?.name ?? "Pokemon"}
          width={475}
          height={475}
        />
      </div>
      <div className={styles.info}>
        <h1 className={styles.name}>
          <span>{pokemon?.name}</span>
          <span className={styles.number}>
            {pokemon && `#${String(pokemon.id).padStart(3, "0")}`}
          </span>
        </h1>
        <div className={styles.types}>
          {(pokemon?.types ?? Array.from({ length: 2 })).map((type, i) => (
            <TypeBadge key={type ?? i} type={type} />
          ))}
        </div>
        <p className={styles.meta}>
          {species &&
            pokemon &&
            `${species.genus} · ${pokemon.height / 10} m · ${pokemon.weight / 10} kg`}
        </p>
        <p className={styles.description} data-bones-lines="2">
          {species?.description}
        </p>
      </div>
    </div>
  );
}
