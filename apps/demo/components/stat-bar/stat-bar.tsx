import { createBones } from "@camp.dev/bones/react";
import styles from "./styles.module.css";

type Stat = { name: string; value: number };

export function StatBar({ stat }: { stat?: Stat | Promise<Stat> }) {
  const { bone, data } = createBones(stat);
  const pct = data ? (data.value / 255) * 100 : 0;

  return (
    <div className={styles.statRow}>
      <span className={styles.statName} {...bone("text")}>
        {data?.name}
      </span>
      <span className={styles.statValue} {...bone("text")}>
        {data && String(data.value)}
      </span>
      <div className={styles.statBarTrack}>
        <div
          className={styles.statBarFill}
          style={{ width: data ? `${pct}%` : "60%" }}
          {...bone("block")}
        />
      </div>
    </div>
  );
}
