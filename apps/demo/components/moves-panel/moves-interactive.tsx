"use client";

import { useState, useMemo, type ComponentProps } from "react";
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

interface MovesInteractiveProps extends ComponentProps<"div"> {
  moves?: PokemonMoveEntry[];
  moveDetails?: Record<string, MoveDetail>;
}

interface FilteredMove {
  name: string;
  level: number;
  detail: MoveDetail | undefined;
}

export function MovesInteractive({ moves = [], moveDetails, ...rest }: MovesInteractiveProps) {
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
    const result: FilteredMove[] = [];

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
    <div className={styles.panel} aria-busy={moveDetails ? undefined : "true"} {...rest}>
      {/* The panel stays busy until the move details arrive, even when the
          move list is already here, so this is the one place a component sets
          its own aria-busy. A caller's aria-busy still wins through ...rest. */}
      <div className={styles.gamePills}>
        {(versionGroups.length
          ? versionGroups
          : Array.from<string | undefined>({ length: 25 })
        ).map((item, i) => (
          <button
            key={item ?? i}
            className={`${styles.pill} ${item === activeGame ? styles.pillActive : ""}`}
            onClick={() => {
              if (!item) return;
              setActiveGame(item);
              setActiveMethod("level-up");
            }}
          >
            <span>{item?.replace(/-/g, " ")}</span>
          </button>
        ))}
      </div>

      <div className={styles.methodTabs}>
        {(availableMethods.length
          ? availableMethods
          : Array.from<(typeof LEARN_METHODS)[number] | undefined>({ length: 4 })
        ).map((item, i) => (
          <button
            key={item ?? i}
            className={`${styles.methodTab} ${item === activeMethod ? styles.methodTabActive : ""}`}
            onClick={() => item && setActiveMethod(item)}
          >
            <span>{item && (METHOD_LABELS[item] ?? item)}</span>
          </button>
        ))}
      </div>

      {moveDetails && filteredMoves.length === 0 ? (
        <p className={styles.empty}>No moves for this method in the selected game.</p>
      ) : (
        <table className={styles.table}>
          <thead data-bones-auto="off">
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
            {(filteredMoves.length
              ? filteredMoves
              : Array.from<FilteredMove | undefined>({ length: 10 })
            ).map((item, i) => (
              <tr key={item ? `${item.name}-${i}` : i}>
                <td className={styles.tdMuted}>
                  <span>
                    {item &&
                      (activeMethod === "machine"
                        ? (item.detail?.machineNumbers[activeGame] ?? "—")
                        : item.level || "—")}
                  </span>
                </td>
                <td className={styles.tdName}>
                  <span>{item?.name.replace(/-/g, " ")}</span>
                </td>
                <td>
                  <TypeBadge type={item?.detail?.type} className={styles.moveType} />
                </td>
                <td className={styles.tdMuted}>
                  <span>{item && (item.detail?.damageClass ?? "—")}</span>
                </td>
                <td className={styles.tdRight}>
                  <span>{item && (item.detail?.power ?? "—")}</span>
                </td>
                <td className={styles.tdRight}>
                  <span>{item && (item.detail?.accuracy ?? "—")}</span>
                </td>
                <td className={styles.tdRight}>
                  <span>{item && (item.detail?.pp ?? "—")}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
