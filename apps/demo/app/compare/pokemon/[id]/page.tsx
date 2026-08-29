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
 * tree with aria-busy and no data so every component shows its skeleton.
 * No data fetching, no API calls, instant render.
 */
export default function ComparePokemonPage() {
  return (
    <main>
      <div className={styles.detailNav}>
        <Link href="/" className={styles.backLink}>
          ← Back to Pokédex
        </Link>
      </div>

      <PokemonHero aria-busy="true" />

      <div className={styles.bentoGrid}>
        <div className={styles.bentoRow1}>
          <BaseStatsCard aria-busy="true" />
          <TypeDefenseCard aria-busy="true" />
        </div>

        <div className={styles.bentoRow2}>
          <InfoCard
            title="Training"
            labels={["EV Yield", "Catch Rate", "Base Exp", "Growth"]}
            aria-busy="true"
          />
          <InfoCard
            title="Breeding"
            labels={["Egg Groups", "Gender", "Egg Cycles", "Friendship"]}
            aria-busy="true"
          />
          <InfoCard
            title="Pokedex Data"
            labels={["Species", "Generation", "Habitat", "Shape"]}
            aria-busy="true"
          />
        </div>

        <EvolutionChainCard currentName="" aria-busy="true" />
      </div>

      <DetailTabs
        tabs={[
          {
            id: "moves",
            label: "Moves",
            content: <MovesPanel aria-busy="true" />,
          },
          {
            id: "dex-entries",
            label: "Dex Entries",
            content: <DexEntriesPanel aria-busy="true" />,
          },
          {
            id: "locations",
            label: "Locations",
            content: null,
          },
        ]}
      />
    </main>
  );
}
