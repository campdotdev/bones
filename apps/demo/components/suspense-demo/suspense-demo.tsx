import { Suspense } from "react";
import { delay } from "@/lib/delay";
import { Await } from "@/lib/await";
import { fetchPokemonList } from "@/lib/pokeapi";
import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonGrid } from "@/components/pokemon-grid/pokemon-grid";

export function SuspenseDemo() {
  return (
    <DemoSection
      title="Streaming with Suspense"
      description={
        <>
          The fallback is the same component with <code>aria-busy</code> and no data. It renders as
          skeletons while the list streams in, then the real grid swaps in when it resolves.
        </>
      }
      hint="Refresh the page to see the skeleton → content transition."
    >
      <Suspense fallback={<PokemonGrid aria-busy="true" />}>
        <Await promise={delay(fetchPokemonList(12), 3000)}>
          {(pokemon) => <PokemonGrid pokemon={pokemon} />}
        </Await>
      </Suspense>
    </DemoSection>
  );
}
