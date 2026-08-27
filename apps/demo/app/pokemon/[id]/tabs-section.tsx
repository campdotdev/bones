import { Suspense } from "react";
import { forceBones } from "@camp.dev/bones/react";
import type { PokemonMoveEntry, MoveDetail, EncounterLocation } from "@/lib/pokeapi";
import { DetailTabs } from "@/components/detail-tabs/detail-tabs";
import { MovesPanel } from "@/components/moves-panel/moves-panel";
import { DexEntriesPanel } from "@/components/dex-entries-panel/dex-entries-panel";
import { LocationsPanel } from "@/components/locations-panel/locations-panel";

interface TabsSectionProps {
  moves: PokemonMoveEntry[] | Promise<PokemonMoveEntry[]>;
  moveDetails: Record<string, MoveDetail> | Promise<Record<string, MoveDetail>>;
  flavorTextEntries:
    | { text: string; version: string }[]
    | Promise<{ text: string; version: string }[]>;
  encounters: EncounterLocation[] | Promise<EncounterLocation[]>;
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
            <Suspense fallback={<MovesPanel moves={forceBones} moveDetails={forceBones} />}>
              <MovesPanel moves={moves} moveDetails={moveDetails} />
            </Suspense>
          ),
        },
        {
          id: "dex-entries",
          label: "Dex Entries",
          content: (
            <Suspense fallback={<DexEntriesPanel entries={forceBones} />}>
              <DexEntriesPanel entries={flavorTextEntries} />
            </Suspense>
          ),
        },
        {
          id: "locations",
          label: "Locations",
          content: (
            <Suspense fallback={<LocationsPanel locations={forceBones} />}>
              <LocationsPanel locations={encounters} />
            </Suspense>
          ),
        },
      ]}
    />
  );
}
