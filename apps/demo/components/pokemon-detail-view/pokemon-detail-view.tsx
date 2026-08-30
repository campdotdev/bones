import Image from "next/image";
import type { ComponentProps } from "react";
import type { PokemonDetail } from "@/lib/pokeapi";
import { TRANSPARENT_PIXEL } from "@/lib/pixel";
import { StatBar } from "@/components/stat-bar/stat-bar";
import { TypeBadge } from "@/components/type-badge/type-badge";
import styles from "./styles.module.css";

export function PokemonDetailView({
  pokemon,
  ...rest
}: { pokemon?: PokemonDetail } & ComponentProps<"div">) {
  return (
    <div className={styles.detail} {...rest}>
      <div className={styles.detailHeader}>
        <Image
          className={styles.detailImage}
          src={pokemon?.artwork ?? TRANSPARENT_PIXEL}
          alt={pokemon?.name ?? "Pokemon"}
          width={475}
          height={475}
        />
        <div className={styles.detailInfo}>
          <h1 className={styles.detailName}>{pokemon?.name}</h1>
          <div className={styles.detailTypes}>
            {(pokemon?.types ?? Array.from({ length: 2 })).map((type, i) => (
              <TypeBadge key={type ?? i} type={type} style={{ width: 56 }} />
            ))}
          </div>
          <div className={styles.detailMeta}>
            <span className={styles.metaItem}>{pokemon && `${pokemon.height / 10} m`}</span>
            <span className={styles.metaItem}>{pokemon && `${pokemon.weight / 10} kg`}</span>
          </div>
        </div>
      </div>

      <section className={styles.detailSection}>
        <h2 data-bones-auto="off">Description</h2>
        <p className={styles.detailDescription} data-bones-lines="3">
          {pokemon?.description}
        </p>
      </section>

      <section className={styles.detailSection}>
        <h2 data-bones-auto="off">Base Stats</h2>
        <div className={styles.stats}>
          {(pokemon?.stats ?? Array.from({ length: 6 })).map((stat, i) => (
            <StatBar key={stat?.name ?? i} stat={stat} />
          ))}
        </div>
      </section>
    </div>
  );
}
