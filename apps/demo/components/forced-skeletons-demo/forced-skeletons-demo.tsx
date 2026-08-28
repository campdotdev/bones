import { forceBones } from "@camp.dev/bones/react";
import { fetchPokemonList } from "@/lib/pokeapi";
import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonGrid } from "@/components/pokemon-grid/pokemon-grid";
import { SkeletonToggle } from "@/components/skeleton-toggle/skeleton-toggle";

export async function ForcedSkeletonsDemo() {
  const pokemon = await fetchPokemonList(12);

  return (
    <DemoSection
      title="Forced Skeletons"
      description="Pass forceBones as a component's data to force its skeleton state. Toggle to see the same loaded cards switch to skeletons."
    >
      <SkeletonToggle skeleton={<PokemonGrid pokemon={forceBones} />}>
        <PokemonGrid pokemon={pokemon} />
      </SkeletonToggle>
    </DemoSection>
  );
}
