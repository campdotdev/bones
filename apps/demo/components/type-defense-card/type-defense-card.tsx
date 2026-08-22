import { createBones } from "@camp.dev/bones/react";
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
}: {
  typeDefense?: TypeDefenseMap | Promise<TypeDefenseMap>;
}) {
  const { bone, data } = createBones(typeDefense);

  type PillItem = { type: string; text: string };
  const groups: { label: string; items: (PillItem | undefined)[] }[] = data
    ? [
        {
          label: "Weak to",
          items: data.weakTo.map((w) => ({
            type: w.type,
            text: `${w.type} ${formatMultiplier(w.multiplier)}`,
          })),
        },
        {
          label: "Resistant to",
          items: data.resistantTo.map((r) => ({
            type: r.type,
            text: `${r.type} ${formatMultiplier(r.multiplier)}`,
          })),
        },
        { label: "Immune to", items: data.immuneTo.map((t) => ({ type: t, text: `${t} 0x` })) },
        { label: "Neutral", items: data.neutral.map((t) => ({ type: t, text: t })) },
      ].filter((g) => g.items.length > 0)
    : [
        { label: "Weak to", items: Array.from({ length: 3 }) },
        { label: "Resistant to", items: Array.from({ length: 4 }) },
        { label: "Neutral", items: Array.from({ length: 5 }) },
      ];

  return (
    <div className={styles.card}>
      <div className={styles.label}>Type Defense</div>
      {groups.map((group) => (
        <div key={group.label} className={styles.group}>
          <div className={styles.groupLabel}>{group.label}</div>
          <div className={styles.pills}>
            {group.items.map((item, i) => (
              <TypeBadge
                key={item?.type ?? i}
                type={item?.type}
                className={styles.pill}
                {...bone("text", { contained: true, length: 7 })}
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
