import Image from "next/image";
import { createBones } from "bones/react";
import type { EvolutionChain } from "@/lib/pokeapi";
import styles from "./styles.module.css";

export function EvolutionChainCard({
  chain,
  currentName,
}: {
  chain?: EvolutionChain | Promise<EvolutionChain>;
  currentName?: string;
}) {
  const { bone, data, repeat } = createBones(chain);

  return (
    <div className={styles.card}>
      <div className={styles.label}>Evolution Chain</div>
      <div className={styles.chains}>
        {repeat(data?.stages, 1, (branch, bi) => (
          <div key={bi} className={styles.branch}>
            {repeat(branch, 3, (item, si) => (
              <div key={item?.name ?? si} className={styles.stageGroup}>
                {si > 0 && (
                  <div className={styles.arrow}>
                    <span>→</span>
                    <span className={styles.trigger} {...bone("text")}>
                      {item?.trigger}
                    </span>
                  </div>
                )}
                <div
                  className={styles.stage}
                  data-current={item?.name === currentName ? "true" : undefined}
                >
                  <div className={styles.sprite} {...bone("block")}>
                    {item && <Image src={item.spriteUrl} alt={item.name} width={96} height={96} />}
                  </div>
                  <span className={styles.stageName} {...bone("text", { length: 6 })}>
                    {item?.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
