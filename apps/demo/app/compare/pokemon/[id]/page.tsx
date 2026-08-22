import { BonesForce, forceBones } from "@camp.dev/bones/react";
import Link from "next/link";
import { PokemonHero } from "@/components/pokemon-hero/pokemon-hero";
import { BaseStatsCard } from "@/components/base-stats-card/base-stats-card";
import { TypeDefenseCard } from "@/components/type-defense-card/type-defense-card";
import { InfoCard } from "@/components/info-card/info-card";
import { EvolutionChainCard } from "@/components/evolution-chain-card/evolution-chain-card";
import { DetailTabs } from "@/components/detail-tabs/detail-tabs";
import { MovesPanel } from "@/components/moves-panel/moves-panel";
import { DexEntriesPanel } from "@/components/dex-entries-panel/dex-entries-panel";
import styles from "@/app/pokemon/[id]/page.module.css";

/**
 * Skeleton-only mirror of the Pokemon detail page.
 * Used by the Compare Bones devtool overlay—renders the same component
 * tree with forceBones so every createBones call shows skeletons.
 * No data fetching, no API calls, instant render.
 */
export default function ComparePokemonPage() {
  return (
    <BonesForce>
      <main>
        <div className={styles.detailNav}>
          <Link href="/" className={styles.backLink}>
            ← Back to Pokédex
          </Link>
        </div>

        <PokemonHero pokemon={forceBones} species={forceBones} />

        <div className={styles.bentoGrid}>
          <div className={styles.bentoRow1}>
            <BaseStatsCard pokemon={forceBones} />
            <TypeDefenseCard typeDefense={forceBones} />
          </div>

          <div className={styles.bentoRow2}>
            <InfoCard
              title="Training"
              labels={["EV Yield", "Catch Rate", "Base Exp", "Growth"]}
              rows={forceBones}
            />
            <InfoCard
              title="Breeding"
              labels={["Egg Groups", "Gender", "Egg Cycles", "Friendship"]}
              rows={forceBones}
            />
            <InfoCard
              title="Pokedex Data"
              labels={["Species", "Generation", "Habitat", "Shape"]}
              rows={forceBones}
            />
          </div>

          <EvolutionChainCard chain={forceBones} currentName="" />
        </div>

        <DetailTabs
          tabs={[
            {
              id: "moves",
              label: "Moves",
              content: <MovesPanel moves={forceBones} moveDetails={forceBones} />,
            },
            {
              id: "dex-entries",
              label: "Dex Entries",
              content: <DexEntriesPanel entries={forceBones} />,
            },
            {
              id: "locations",
              label: "Locations",
              content: null,
            },
          ]}
        />
      </main>
    </BonesForce>
  );
}
