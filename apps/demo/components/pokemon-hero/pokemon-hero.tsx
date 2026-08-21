import Image from "next/image";
import { createBones } from "bones/react";
import type { PokemonData, SpeciesData } from "@/lib/pokeapi";
import { TypeBadge } from "@/components/type-badge/type-badge";
import styles from "./styles.module.css";

export function PokemonHero({
  pokemon,
  species,
}: {
  pokemon?: PokemonData | Promise<PokemonData>;
  species?: SpeciesData | Promise<SpeciesData>;
}) {
  const { bone: pokeBone, data: poke, repeat } = createBones(pokemon);
  const { bone: specBone, data: spec } = createBones(species);

  return (
    <div className={styles.hero}>
      <div className={styles.imageBox}>
        <Image
          className={styles.artwork}
          src={poke?.artwork ?? ""}
          alt={poke?.name ?? "Pokemon"}
          width={475}
          height={475}
          {...pokeBone("block")}
        />
      </div>
      <div className={styles.info}>
        <h1 className={styles.name}>
          <span {...pokeBone("text")}>{poke?.name}</span>
          <span className={styles.number} {...pokeBone("text", { length: 4 })}>
            {poke && `#${String(poke.id).padStart(3, "0")}`}
          </span>
        </h1>
        <div className={styles.types}>
          {repeat(poke?.types, 2, (item, i) => (
            <TypeBadge
              key={item ?? i}
              type={item}
              {...pokeBone("text", { contained: true, length: 7 })}
            />
          ))}
        </div>
        <p className={styles.meta} {...specBone("text")}>
          {spec && poke && `${spec.genus} · ${poke.height / 10} m · ${poke.weight / 10} kg`}
        </p>
        <p className={styles.description} {...specBone("text")}>
          {spec?.description}
        </p>
      </div>
    </div>
  );
}
