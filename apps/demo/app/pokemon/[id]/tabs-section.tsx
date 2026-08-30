import { Suspense } from "react";
import { Await } from "@/lib/await";
import type { PokemonMoveEntry, MoveDetail, EncounterLocation } from "@/lib/pokeapi";
import { DetailTabs } from "@/components/detail-tabs/detail-tabs";
import { MovesPanel } from "@/components/moves-panel/moves-panel";
import { DexEntriesPanel } from "@/components/dex-entries-panel/dex-entries-panel";
import { LocationsPanel } from "@/components/locations-panel/locations-panel";

interface TabsSectionProps {
  moves: Promise<PokemonMoveEntry[]>;
  moveDetails: Promise<Record<string, MoveDetail>>;
  flavorTextEntries: Promise<{ text: string; version: string }[]>;
  encounters: Promise<EncounterLocation[]>;
}

export function TabsSection({
  moves,
  moveDetails,
  flavorTextEntries,
  encounters,
}: TabsSectionProps) {
  return (
    <DetailTabs
      tabs={[
        {
          id: "moves",
          label: "Moves",
          content: (
            <Suspense fallback={<MovesPanel aria-busy="true" />}>
              <Await promise={Promise.all([moves, moveDetails])}>
                {([movesData, details]) => <MovesPanel moves={movesData} moveDetails={details} />}
              </Await>
            </Suspense>
          ),
        },
        {
          id: "dex-entries",
          label: "Dex Entries",
          content: (
            <Suspense fallback={<DexEntriesPanel aria-busy="true" />}>
              <Await promise={flavorTextEntries}>
                {(entries) => <DexEntriesPanel entries={entries} />}
              </Await>
            </Suspense>
          ),
        },
        {
          id: "locations",
          label: "Locations",
          content: (
            <Suspense fallback={<LocationsPanel />}>
              <Await promise={encounters}>
                {(locations) => <LocationsPanel locations={locations} />}
              </Await>
            </Suspense>
          ),
        },
      ]}
    />
  );
}
