import { forceBones } from "@camp.dev/bones/react";
import { DemoSection } from "@/components/demo-section/demo-section";
import { PokemonCard } from "@/components/pokemon-card/pokemon-card";
import styles from "./styles.module.css";

export function ThemingDemo() {
  return (
    <DemoSection
      title="Theming"
      description={
        <>
          Customize skeleton colors with CSS custom properties. Override <code>--bone-base</code>{" "}
          and <code>--bone-highlight</code> on any container.
        </>
      }
    >
      <div className={styles.themeDemos}>
        <div
          className={styles.themeDemo}
          style={{
            "--bone-base": "rgba(180, 120, 60, 0.2)",
            "--bone-highlight": "rgba(180, 120, 60, 0.1)",
            "--card-bg": "rgb(44, 34, 22)",
            "--border": "rgb(62, 48, 32)",
            "--muted": "rgb(180, 150, 110)",
          }}
        >
          <h3>Warm</h3>
          <PokemonCard pokemon={forceBones} />
        </div>
        <div
          className={styles.themeDemo}
          style={{
            "--bone-base": "rgba(60, 120, 180, 0.2)",
            "--bone-highlight": "rgba(60, 120, 180, 0.1)",
            "--card-bg": "rgb(20, 30, 46)",
            "--border": "rgb(35, 50, 72)",
            "--muted": "rgb(110, 150, 190)",
          }}
        >
          <h3>Cool</h3>
          <PokemonCard pokemon={forceBones} />
        </div>
        <div
          className={styles.themeDemo}
          style={{
            "--bone-base": "rgba(255, 255, 255, 0.12)",
            "--bone-highlight": "rgba(255, 255, 255, 0.06)",
            "--card-bg": "rgb(10, 10, 10)",
            "--border": "rgb(30, 30, 30)",
            "--muted": "rgb(120, 120, 120)",
          }}
        >
          <h3>Dark</h3>
          <PokemonCard pokemon={forceBones} />
        </div>
      </div>
    </DemoSection>
  );
}
