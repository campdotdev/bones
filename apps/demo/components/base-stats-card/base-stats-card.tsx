import { createBones } from "@camp.dev/bones/react";
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

export function BaseStatsCard({ pokemon }: { pokemon?: PokemonData | Promise<PokemonData> }) {
  const { bone, data } = createBones(pokemon);
  const total = data?.stats.reduce((sum, s) => sum + s.value, 0) ?? 0;
  const statsByName = data ? Object.fromEntries(data.stats.map((s) => [s.name, s])) : null;

  return (
    <div className={styles.card}>
      <div className={styles.label}>Base Stats</div>
      <div className={styles.stats}>
        {STAT_KEYS.map((key) => {
          const stat = statsByName?.[key];
          const pct = stat ? (stat.value / 255) * 100 : 0;
          return (
            <div key={key} className={styles.row}>
              <span className={styles.name}>{STAT_LABELS[key]}</span>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{ width: stat ? `${pct}%` : "60%" }}
                  {...bone("block")}
                />
              </div>
              <span className={styles.value} {...bone("text", { length: 2 })}>
                {stat && String(stat.value)}
              </span>
            </div>
          );
        })}
      </div>
      <div className={styles.total}>
        <span>Total</span>
        <span {...bone("text", { length: 3 })}>{data && String(total)}</span>
      </div>
    </div>
  );
}
