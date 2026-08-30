"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./pokemon-card.module.css";

interface Pokemon {
  name: string;
  sprite: string;
  types: string[];
}

const MOCK_POKEMON: Pokemon = {
  name: "cubone",
  sprite:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/104.png",
  types: ["ground"],
};

// next/image refuses an empty src; the stylesheet's block rule hides
// whatever this pixel would show.
const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function PokemonCard({ pokemon }: { pokemon?: Pokemon }) {
  return (
    <div className={styles.card}>
      <Image
        className={styles.cardImage}
        src={pokemon?.sprite ?? TRANSPARENT_PIXEL}
        alt={pokemon?.name ?? "Pokemon"}
        width={120}
        height={120}
      />
      <h3 className={styles.cardName}>{pokemon?.name}</h3>
      <div className={styles.cardTypes}>
        {(pokemon?.types ?? Array.from({ length: 2 })).map((type, i) => (
          <span key={type ?? i} className={`${styles.badge}${type ? ` ${styles[type]}` : ""}`}>
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DemoPokemonCard() {
  const [blend, setBlend] = useState(0);

  return (
    <div>
      <div className={styles.cardStack}>
        <div style={{ opacity: 1 - blend }}>
          <PokemonCard pokemon={MOCK_POKEMON} />
        </div>
        <div
          className={styles.cardOverlay}
          aria-busy="true"
          data-bones-animate="shimmer"
          style={{ opacity: blend }}
        >
          <PokemonCard />
        </div>
      </div>
      <div className={styles.sliderRow}>
        <span className={styles.sliderLabel}>Loaded</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={blend}
          onChange={(e) => setBlend(Number(e.target.value))}
          className={styles.slider}
        />
        <span className={styles.sliderLabel}>Skeleton</span>
      </div>
    </div>
  );
}
