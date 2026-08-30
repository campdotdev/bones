import { HeroSection } from "@/components/hero-section/hero-section";
import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonGrid } from "@/components/pokemon-grid/pokemon-grid";
import { SkeletonToggle } from "@/components/skeleton-toggle/skeleton-toggle";
import { MultiLineTextDemo } from "@/components/multi-line-text-demo/multi-line-text-demo";
import { AnimationsDemo } from "@/components/animations-demo/animations-demo";
import { ThemingDemo } from "@/components/theming-demo/theming-demo";

/**
 * Skeleton-only mirror of the home page.
 * Used by the Compare Bones devtool overlay.
 *
 * SuspenseDemo and ForcedSkeletonsDemo fetch data internally,
 * so we inline their skeleton equivalents here instead.
 */
export default function CompareHomePage() {
  return (
    <main>
      <HeroSection />

      {/* SuspenseDemo skeleton equivalent */}
      <DemoSection
        title="Streaming with Suspense"
        description={
          <>
            The fallback is the same component with <code>aria-busy</code> and no data. It renders
            as skeletons while the list streams in, then the real grid swaps in when it resolves.
          </>
        }
        hint="Refresh the page to see the skeleton → content transition."
      >
        <PokemonGrid aria-busy="true" />
      </DemoSection>

      {/* ForcedSkeletonsDemo skeleton equivalent */}
      <DemoSection
        title="Forced Skeletons"
        description="Render a component with aria-busy and no data to see its skeleton. Toggle to swap the loaded grid for that skeleton."
      >
        <SkeletonToggle skeleton={<PokemonGrid aria-busy="true" />}>
          <PokemonGrid aria-busy="true" />
        </SkeletonToggle>
      </DemoSection>

      <MultiLineTextDemo />
      <AnimationsDemo />
      <ThemingDemo />
    </main>
  );
}
