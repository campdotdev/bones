import type { ComponentProps } from "react";
import styles from "./styles.module.css";

interface InfoRow {
  label: string;
  value: string;
}

export function InfoCard({
  title,
  labels,
  rows,
  ...rest
}: { title: string; labels: string[]; rows?: InfoRow[] } & ComponentProps<"div">) {
  const valuesByLabel = rows ? Object.fromEntries(rows.map((r) => [r.label, r.value])) : null;

  return (
    <div className={styles.card} {...rest}>
      <div className={styles.label} data-bones-auto="off">
        {title}
      </div>
      <div className={styles.rows}>
        {labels.map((label) => (
          <div key={label} className={styles.row}>
            <span className={styles.rowLabel} data-bones-auto="off">
              {label}
            </span>
            <span className={styles.rowValue}>{valuesByLabel?.[label]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
