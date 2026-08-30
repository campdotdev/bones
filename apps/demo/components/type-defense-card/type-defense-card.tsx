import type { ComponentProps } from "react";
import type { TypeDefenseMap } from "@/lib/pokeapi";
import { TypeBadge } from "@/components/type-badge/type-badge";
import styles from "./styles.module.css";

function formatMultiplier(m: number): string {
  if (m === 0.25) return "¼x";
  if (m === 0.5) return "½x";
  return `${m}x`;
}

export function TypeDefenseCard({
  typeDefense,
  ...rest
}: { typeDefense?: TypeDefenseMap } & ComponentProps<"div">) {
  type PillItem = { type: string; text: string };
  const groups: { label: string; items: (PillItem | undefined)[] }[] = typeDefense
    ? [
        {
          label: "Weak to",
          items: typeDefense.weakTo.map((w) => ({
            type: w.type,
            text: `${w.type} ${formatMultiplier(w.multiplier)}`,
          })),
        },
        {
          label: "Resistant to",
          items: typeDefense.resistantTo.map((r) => ({
            type: r.type,
            text: `${r.type} ${formatMultiplier(r.multiplier)}`,
          })),
        },
        {
          label: "Immune to",
          items: typeDefense.immuneTo.map((t) => ({ type: t, text: `${t} 0x` })),
        },
        { label: "Neutral", items: typeDefense.neutral.map((t) => ({ type: t, text: t })) },
      ].filter((g) => g.items.length > 0)
    : [
        { label: "Weak to", items: Array.from({ length: 3 }) },
        { label: "Resistant to", items: Array.from({ length: 4 }) },
        { label: "Neutral", items: Array.from({ length: 5 }) },
      ];

  return (
    <div className={styles.card} {...rest}>
      <div className={styles.label} data-bones-auto="off">
        Type Defense
      </div>
      {groups.map((group) => (
        <div key={group.label} className={styles.group}>
          <div className={styles.groupLabel} data-bones-auto="off">
            {group.label}
          </div>
          <div className={styles.pills}>
            {group.items.map((item, i) => (
              <TypeBadge
                key={item?.type ?? i}
                type={item?.type}
                className={styles.pill}
                data-bones-length="7"
              >
                {item?.text}
              </TypeBadge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
