import { BonesForce } from "bones/react";
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
    <BonesForce>
      <main>
        <HeroSection />

        {/* SuspenseDemo skeleton equivalent */}
        <DemoSection
          title="Streaming with Suspense"
          description={
            <>
              Wrap a component in <code>{"<Bones>"}</code> and pass a promise as data. The{" "}
              <strong>same component</strong> renders as skeletons while the data streams in, then
              swaps to content when it resolves.
            </>
          }
          hint="Refresh the page to see the skeleton → content transition."
        >
          <PokemonGrid />
        </DemoSection>

        {/* ForcedSkeletonsDemo skeleton equivalent */}
        <DemoSection
          title="Forced Skeletons"
          description="Wrap with BonesForce to force skeleton mode. Toggle to see the same loaded cards switch to skeletons."
        >
          <SkeletonToggle skeleton={<PokemonGrid />}>
            <PokemonGrid />
          </SkeletonToggle>
        </DemoSection>

        <MultiLineTextDemo />
        <AnimationsDemo />
        <ThemingDemo />
      </main>
    </BonesForce>
  );
}
