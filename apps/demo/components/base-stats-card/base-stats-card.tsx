import type { ComponentProps } from "react";
import type { PokemonData } from "@/lib/pokeapi";
import styles from "./styles.module.css";

const STAT_KEYS = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Attack",
  "special-defense": "Sp. Defense",
  speed: "Speed",
};

export function BaseStatsCard({
  pokemon,
  ...rest
}: { pokemon?: PokemonData } & ComponentProps<"div">) {
  const total = pokemon?.stats.reduce((sum, s) => sum + s.value, 0) ?? 0;
  const statsByName = pokemon ? Object.fromEntries(pokemon.stats.map((s) => [s.name, s])) : null;

  return (
    <div className={styles.card} {...rest}>
      <div className={styles.label} data-bones-auto="off">
        Base Stats
      </div>
      <div className={styles.stats}>
        {STAT_KEYS.map((key) => {
          const stat = statsByName?.[key];
          const pct = stat ? (stat.value / 255) * 100 : 0;
          return (
            <div key={key} className={styles.row}>
              <span className={styles.name} data-bones-auto="off">
                {STAT_LABELS[key]}
              </span>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{ width: stat ? `${pct}%` : "60%" }}
                  data-bones-type="block"
                />
              </div>
              <span className={styles.value}>{stat && String(stat.value)}</span>
            </div>
          );
        })}
      </div>
      <div className={styles.total}>
        <span data-bones-auto="off">Total</span>
        <span>{pokemon && String(total)}</span>
      </div>
    </div>
  );
}
