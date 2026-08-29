import Image from "next/image";
import type { ComponentProps } from "react";
import type { EvolutionChain } from "@/lib/pokeapi";
import styles from "./styles.module.css";

export function EvolutionChainCard({
  chain,
  currentName,
  ...rest
}: { chain?: EvolutionChain; currentName?: string } & ComponentProps<"div">) {
  const branches = chain?.stages ?? [undefined];

  return (
    <div className={styles.card} {...rest}>
      <div className={styles.label} data-bones-auto="off">
        Evolution Chain
      </div>
      <div className={styles.chains}>
        {branches.map((branch, bi) => (
          <div key={bi} className={styles.branch}>
            {(branch ?? Array.from({ length: 3 })).map((item, si) => (
              <div key={item?.name ?? si} className={styles.stageGroup}>
                {si > 0 && (
                  <div className={styles.arrow}>
                    <span data-bones-auto="off">→</span>
                    <span className={styles.trigger}>{item?.trigger}</span>
                  </div>
                )}
                <div
                  className={styles.stage}
                  data-current={item?.name === currentName ? "true" : undefined}
                >
                  <div className={styles.sprite} data-bones-type="block">
                    {item && <Image src={item.spriteUrl} alt={item.name} width={96} height={96} />}
                  </div>
                  <span className={styles.stageName}>{item?.name}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
