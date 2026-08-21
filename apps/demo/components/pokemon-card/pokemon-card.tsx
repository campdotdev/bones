import Image from "next/image";
import { createBones } from "bones/react";
import Link from "next/link";
import type { PokemonListItem } from "@/lib/pokeapi";
import { TypeBadge } from "@/components/type-badge/type-badge";
import styles from "./styles.module.css";

export function PokemonCard({ pokemon }: { pokemon?: PokemonListItem | Promise<PokemonListItem> }) {
  const { bone, data, repeat } = createBones(pokemon);

  const card = (
    <div className={styles.card}>
      <Image
        className={styles.cardImage}
        src={data?.sprite ?? ""}
        alt={data?.name ?? "Pokemon"}
        width={120}
        height={120}
        {...bone("block")}
      />
      <h3 className={styles.cardName} {...bone("text", { length: 9 })}>
        {data?.name}
      </h3>
      <div className={styles.cardTypes}>
        {repeat(data?.types, 2, (item, i) => (
          <TypeBadge
            key={item ?? i}
            type={item}
            {...bone("text", { contained: true, length: 7 })}
          />
        ))}
      </div>
    </div>
  );

  if (data) {
    return (
      <Link href={`/pokemon/${data.id}`} className={styles.cardLink}>
        {card}
      </Link>
    );
  }

  return card;
}
