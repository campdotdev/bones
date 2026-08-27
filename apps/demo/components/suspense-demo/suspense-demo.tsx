import { Suspense } from "react";
import { forceBones } from "@camp.dev/bones/react";
import { delay } from "@/lib/delay";
import { fetchPokemonList } from "@/lib/pokeapi";
import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonGrid } from "@/components/pokemon-grid/pokemon-grid";

export function SuspenseDemo() {
  return (
    <DemoSection
      title="Streaming with Suspense"
      description={
        <>
          Pass a promise as data and let the fallback be the same component with{" "}
          <code>forceBones</code>. The same component renders as skeletons while the data streams
          in, then swaps to content when it resolves.
        </>
      }
      hint="Refresh the page to see the skeleton → content transition."
    >
      <Suspense fallback={<PokemonGrid pokemon={forceBones} />}>
        <PokemonGrid pokemon={delay(fetchPokemonList(12), 3000)} />
      </Suspense>
    </DemoSection>
  );
}
