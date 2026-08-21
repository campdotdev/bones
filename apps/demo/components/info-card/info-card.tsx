import { createBones } from "bones/react";
import styles from "./styles.module.css";

interface InfoRow {
  label: string;
  value: string;
}

export function InfoCard({
  title,
  labels,
  rows,
}: {
  title: string;
  labels: string[];
  rows?: InfoRow[] | Promise<InfoRow[]>;
}) {
  const { bone, data } = createBones(rows);
  const valuesByLabel = data ? Object.fromEntries(data.map((r) => [r.label, r.value])) : null;

  return (
    <div className={styles.card}>
      <div className={styles.label}>{title}</div>
      <div className={styles.rows}>
        {labels.map((label) => (
          <div key={label} className={styles.row}>
            <span className={styles.rowLabel}>{label}</span>
            <span className={styles.rowValue} {...bone("text")}>
              {valuesByLabel?.[label]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
