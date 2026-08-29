import { fetchPokemonList } from "@/lib/pokeapi";
import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonGrid } from "@/components/pokemon-grid/pokemon-grid";
import { SkeletonToggle } from "@/components/skeleton-toggle/skeleton-toggle";

export async function ForcedSkeletonsDemo() {
  const pokemon = await fetchPokemonList(12);

  return (
    <DemoSection
      title="Forced Skeletons"
      description="Render a component with aria-busy and no data to see its skeleton. Toggle to see the same loaded cards switch to skeletons."
    >
      <SkeletonToggle skeleton={<PokemonGrid aria-busy="true" />}>
        <PokemonGrid pokemon={pokemon} />
      </SkeletonToggle>
    </DemoSection>
  );
}
