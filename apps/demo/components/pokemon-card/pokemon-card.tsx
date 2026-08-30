import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { PokemonListItem } from "@/lib/pokeapi";
import { TRANSPARENT_PIXEL } from "@/lib/pixel";
import { TypeBadge } from "@/components/type-badge/type-badge";
import styles from "./styles.module.css";

export function PokemonCard({
  pokemon,
  ...rest
}: { pokemon?: PokemonListItem } & ComponentProps<"div">) {
  const card = (
    <div className={styles.card} {...rest}>
      <Image
        className={styles.cardImage}
        src={pokemon?.sprite ?? TRANSPARENT_PIXEL}
        alt={pokemon?.name ?? "Pokemon"}
        width={120}
        height={120}
      />
      <h3 className={styles.cardName}>{pokemon?.name}</h3>
      <div className={styles.cardTypes}>
        {(pokemon?.types ?? Array.from({ length: 2 })).map((type, i) => (
          <TypeBadge key={type ?? i} type={type} />
        ))}
      </div>
    </div>
  );

  if (pokemon) {
    return (
      <Link href={`/pokemon/${pokemon.id}`} className={styles.cardLink}>
        {card}
      </Link>
    );
  }

  return card;
}
