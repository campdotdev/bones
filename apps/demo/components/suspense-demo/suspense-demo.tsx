import { Bones } from "@camp.dev/bones/react";
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
          Wrap a component in <code>{"<Bones>"}</code> and pass a promise as data. The same
          component renders as skeletons while the data streams in, then swaps to content when it
          resolves.
        </>
      }
      hint="Refresh the page to see the skeleton → content transition."
    >
      <Bones>
        <PokemonGrid pokemon={delay(fetchPokemonList(12), 3000)} />
      </Bones>
    </DemoSection>
  );
}
