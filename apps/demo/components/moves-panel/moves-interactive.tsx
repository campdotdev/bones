"use client";

import { useState, useMemo } from "react";
import { createBones, minMax } from "@camp.dev/bones/react";
import type { PokemonMoveEntry, MoveDetail } from "@/lib/pokeapi";
import { TypeBadge } from "@/components/type-badge/type-badge";
import styles from "./styles.module.css";

const LEARN_METHODS = ["level-up", "machine", "egg", "tutor"] as const;
const METHOD_LABELS: Record<string, string> = {
  "level-up": "Level Up",
  machine: "TM / HM",
  egg: "Egg Moves",
  tutor: "Tutor",
};

interface MovesInteractiveProps {
  moves?: PokemonMoveEntry[];
  moveDetails?: Record<string, MoveDetail>;
}

export function MovesInteractive({ moves = [], moveDetails }: MovesInteractiveProps) {
  const { bone, repeat } = createBones({ loading: !moveDetails });

  const versionGroups = useMemo(() => {
    const set = new Set<string>();
    for (const move of moves) {
      for (const vd of move.versionDetails) {
        set.add(vd.versionGroup);
      }
    }
    return [...set].reverse();
  }, [moves]);

  const [activeGame, setActiveGame] = useState(versionGroups[0] ?? "");
  const [activeMethod, setActiveMethod] = useState<string>("level-up");

  const filteredMoves = useMemo(() => {
    const result: {
      name: string;
      level: number;
      detail: MoveDetail | undefined;
    }[] = [];

    for (const move of moves) {
      for (const vd of move.versionDetails) {
        if (vd.versionGroup === activeGame && vd.learnMethod === activeMethod) {
          result.push({
            name: move.name,
            level: vd.levelLearnedAt,
            detail: moveDetails?.[move.name],
          });
        }
      }
    }

    if (activeMethod === "level-up") {
      result.sort((a, b) => a.level - b.level);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [moves, moveDetails, activeGame, activeMethod]);

  const availableMethods = useMemo(() => {
    const set = new Set<string>();
    for (const move of moves) {
      for (const vd of move.versionDetails) {
        if (vd.versionGroup === activeGame) {
          set.add(vd.learnMethod);
        }
      }
    }
    return LEARN_METHODS.filter((m) => set.has(m));
  }, [moves, activeGame]);

  return (
    <div className={styles.panel}>
      <div className={styles.gamePills}>
        {repeat(versionGroups, 25, (item, i) => (
          <button
            key={item ?? i}
            className={`${styles.pill} ${item === activeGame ? styles.pillActive : ""}`}
            onClick={() => {
              if (!item) return;
              setActiveGame(item);
              setActiveMethod("level-up");
            }}
          >
            <span {...bone("text", { length: minMax(4, 12), contained: true })}>
              {item?.replace(/-/g, " ")}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.methodTabs}>
        {repeat(availableMethods, 4, (item, i) => (
          <button
            key={item ?? i}
            className={`${styles.methodTab} ${item === activeMethod ? styles.methodTabActive : ""}`}
            onClick={() => item && setActiveMethod(item)}
          >
            <span {...bone("text", { length: minMax(2, 12), contained: true })}>
              {item && (METHOD_LABELS[item] ?? item)}
            </span>
          </button>
        ))}
      </div>

      {moveDetails && filteredMoves.length === 0 ? (
        <p className={styles.empty}>No moves for this method in the selected game.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLeft}>{activeMethod === "level-up" ? "Lv." : "#"}</th>
              <th className={styles.thLeft}>Move</th>
              <th className={styles.thLeft}>Type</th>
              <th className={styles.thLeft}>Cat.</th>
              <th className={styles.thRight}>Pwr</th>
              <th className={styles.thRight}>Acc</th>
              <th className={styles.thRight}>PP</th>
            </tr>
          </thead>
          <tbody>
            {repeat(filteredMoves, 10, (item, i) => (
              <tr key={item ? `${item.name}-${i}` : i}>
                <td className={styles.tdMuted}>
                  <span {...bone("text", { length: 2, contained: true })}>
                    {item &&
                      (activeMethod === "machine"
                        ? (item.detail?.machineNumbers[activeGame] ?? "—")
                        : item.level || "—")}
                  </span>
                </td>
                <td className={styles.tdName}>
                  <span {...bone("text", { length: minMax(5, 10), contained: true })}>
                    {item?.name.replace(/-/g, " ")}
                  </span>
                </td>
                <td>
                  <TypeBadge
                    type={item?.detail?.type}
                    className={styles.moveType}
                    {...bone("text", { contained: true, length: 5 })}
                  />
                </td>
                <td className={styles.tdMuted}>
                  <span {...bone("text", { length: 4, contained: true })}>
                    {item && (item.detail?.damageClass ?? "—")}
                  </span>
                </td>
                <td className={styles.tdRight}>
                  <span {...bone("text", { length: 2, contained: true })}>
                    {item && (item.detail?.power ?? "—")}
                  </span>
                </td>
                <td className={styles.tdRight}>
                  <span {...bone("text", { length: 2, contained: true })}>
                    {item && (item.detail?.accuracy ?? "—")}
                  </span>
                </td>
                <td className={styles.tdRight}>
                  <span {...bone("text", { length: 2, contained: true })}>
                    {item && (item.detail?.pp ?? "—")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
