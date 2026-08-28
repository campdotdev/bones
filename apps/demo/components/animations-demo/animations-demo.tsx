import { forceBones } from "@camp.dev/bones/react";
import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonCard } from "@/components/pokemon-card/pokemon-card";
import styles from "./styles.module.css";

export function AnimationsDemo() {
  return (
    <DemoSection
      title="Animations"
      description={
        <>
          Add <code>data-bone-animate</code> to any parent element. Set it on{" "}
          <code>&lt;body&gt;</code> for app-wide animation, or scope it to individual sections.
        </>
      }
    >
      <div className={styles.animationDemos}>
        <div className={styles.animationDemo} data-bone-animate="none">
          <h3>Static</h3>
          <PokemonCard pokemon={forceBones} />
        </div>
        <div className={styles.animationDemo} data-bone-animate="shimmer">
          <h3>Shimmer</h3>
          <PokemonCard pokemon={forceBones} />
        </div>
        <div className={styles.animationDemo} data-bone-animate="pulse">
          <h3>Pulse</h3>
          <PokemonCard pokemon={forceBones} />
        </div>
      </div>
    </DemoSection>
  );
}
