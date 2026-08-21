"use client";

import { useState } from "react";
import Image from "next/image";
import { createBones } from "bones/react";
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

function PokemonCard({ pokemon, loading }: { pokemon?: Pokemon; loading?: boolean }) {
  const { bone, data, repeat } = createBones(pokemon, { loading });

  return (
    <div className={styles.card}>
      <Image
        className={styles.cardImage}
        src={data?.sprite ?? ""}
        alt={data?.name ?? "Pokemon"}
        width={120}
        height={120}
        {...bone("block")}
      />
      <h3 className={styles.cardName} {...bone("text", { length: 5 })}>
        {data?.name}
      </h3>
      <div className={styles.cardTypes}>
        {repeat(data?.types, 2, (type, i) => (
          <span
            key={type ?? i}
            className={`${styles.badge}${type ? ` ${styles[type]}` : ""}`}
            {...bone("text", { contained: true, length: 7 })}
          >
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
        <div className={styles.cardOverlay} data-bone-animate="shimmer" style={{ opacity: blend }}>
          <PokemonCard pokemon={MOCK_POKEMON} loading />
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
