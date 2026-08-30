import type { ComponentProps } from "react";
import styles from "./styles.module.css";

type Stat = { name: string; value: number };

export function StatBar({ stat, ...rest }: { stat?: Stat } & ComponentProps<"div">) {
  const pct = stat ? (stat.value / 255) * 100 : 0;

  return (
    <div className={styles.statRow} {...rest}>
      <span className={styles.statName}>{stat?.name}</span>
      <span className={styles.statValue}>{stat && String(stat.value)}</span>
      <div className={styles.statBarTrack}>
        <div
          className={styles.statBarFill}
          style={{ width: stat ? `${pct}%` : "60%" }}
          data-bones-type="block"
        />
      </div>
    </div>
  );
}
