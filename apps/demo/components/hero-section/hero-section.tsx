import styles from "./styles.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <h1>bones</h1>
      <p className={styles.heroSubtitle}>
        Automatic skeleton loaders for any stack. One stylesheet, one custom element.
      </p>
      <div className={styles.heroLinks}>
        <a href="https://bones.lovo.sh" className={styles.heroLink}>
          Docs
        </a>
        <span className={styles.heroDot} aria-hidden="true" />
        <a
          href="https://github.com/campdotdev/bones"
          className={styles.heroLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </section>
  );
}
