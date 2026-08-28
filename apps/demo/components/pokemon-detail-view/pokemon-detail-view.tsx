import Image from "next/image";
import { createBones, forceBones } from "@camp.dev/bones/react";
import type { PokemonDetail } from "@/lib/pokeapi";
import { StatBar } from "@/components/stat-bar/stat-bar";
import { TypeBadge } from "@/components/type-badge/type-badge";
import styles from "./styles.module.css";

export function PokemonDetailView({
  pokemon,
}: {
  pokemon?: PokemonDetail | Promise<PokemonDetail>;
}) {
  const { bone, data, repeat, lines } = createBones(pokemon);

  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <Image
          className={styles.detailImage}
          src={data?.artwork ?? ""}
          alt={data?.name ?? "Pokemon"}
          width={475}
          height={475}
          {...bone("block")}
        />
        <div className={styles.detailInfo}>
          <h1 className={styles.detailName} {...bone("text")}>
            {data?.name}
          </h1>
          <div className={styles.detailTypes}>
            {repeat(data?.types, 2, (item, i) => (
              <TypeBadge key={item ?? i} type={item} style={{ width: 56 }} {...bone("text")} />
            ))}
          </div>
          <div className={styles.detailMeta}>
            <span className={styles.metaItem} {...bone("text")}>
              {data && `${data.height / 10} m`}
            </span>
            <span className={styles.metaItem} {...bone("text")}>
              {data && `${data.weight / 10} kg`}
            </span>
          </div>
        </div>
      </div>

      <section className={styles.detailSection}>
        <h2>Description</h2>
        {lines(data?.description, 3, (item) => (
          <p className={styles.detailDescription}>{item}</p>
        ))}
      </section>

      <section className={styles.detailSection}>
        <h2>Base Stats</h2>
        <div className={styles.stats}>
          {repeat(data?.stats, 6, (item, i) => (
            <StatBar key={item?.name ?? i} stat={item ?? forceBones} />
          ))}
        </div>
      </section>
    </div>
  );
}
