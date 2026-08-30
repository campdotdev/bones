import type { EncounterLocation } from "@/lib/pokeapi";
import styles from "./styles.module.css";

const VERSION_TO_GENERATION: Record<string, string> = {
  red: "I",
  blue: "I",
  yellow: "I",
  gold: "II",
  silver: "II",
  crystal: "II",
  ruby: "III",
  sapphire: "III",
  emerald: "III",
  firered: "III",
  leafgreen: "III",
  diamond: "IV",
  pearl: "IV",
  platinum: "IV",
  heartgold: "IV",
  soulsilver: "IV",
  black: "V",
  white: "V",
  "black-2": "V",
  "white-2": "V",
  x: "VI",
  y: "VI",
  "omega-ruby": "VI",
  "alpha-sapphire": "VI",
  sun: "VII",
  moon: "VII",
  "ultra-sun": "VII",
  "ultra-moon": "VII",
  "lets-go-pikachu": "VII",
  "lets-go-eevee": "VII",
  sword: "VIII",
  shield: "VIII",
  "legends-arceus": "VIII",
  "brilliant-diamond": "VIII",
  "shining-pearl": "VIII",
  scarlet: "IX",
  violet: "IX",
};

function romanToNum(r: string): number {
  const map: Record<string, number> = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
    VII: 7,
    VIII: 8,
    IX: 9,
    "?": 99,
  };
  return map[r] ?? 99;
}

export function LocationsPanel({ locations }: { locations?: EncounterLocation[] }) {
  if (!locations) return null;

  if (locations.length === 0) {
    return (
      <p className={styles.empty}>
        No encounter locations found. This Pokemon may only be available as a starter, gift, or
        trade.
      </p>
    );
  }

  const grouped: Record<string, Record<string, EncounterLocation[]>> = {};

  for (const loc of locations) {
    const gen = VERSION_TO_GENERATION[loc.version] ?? "?";
    if (!grouped[gen]) grouped[gen] = {};
    if (!grouped[gen][loc.version]) grouped[gen][loc.version] = [];
    grouped[gen][loc.version].push(loc);
  }

  const generations = Object.entries(grouped).sort(([a], [b]) => romanToNum(a) - romanToNum(b));

  return (
    <div className={styles.panel}>
      {generations.map(([gen, versions]) => (
        <div key={gen} className={styles.genGroup}>
          <div className={styles.genHeader}>Generation {gen}</div>
          {Object.entries(versions).map(([version, locs]) => (
            <div key={version} className={styles.entry}>
              <span className={styles.versionLabel}>{version.replace(/-/g, " ")}</span>
              <span className={styles.locationText}>{locs.map((l) => l.location).join(", ")}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
