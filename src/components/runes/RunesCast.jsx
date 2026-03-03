import React from 'react';
import RuneStone from './RuneStone';
import styles from './RunesCast.module.css';

const POSITIONS = ['Passado', 'Presente', 'Futuro'];

const normalizeRunes = (runes) => {
  if (!Array.isArray(runes)) return [];
  return runes.filter(Boolean).slice(0, 3);
};

export default function RunesCast({ runes = [] }) {
  const normalizedRunes = normalizeRunes(runes);

  if (normalizedRunes.length === 0) {
    return null;
  }

  return (
    <section className={styles.cast} aria-label="Lançamento de runas da semana">
      {normalizedRunes.map((rune, index) => (
        <RuneStone
          key={`${typeof rune === 'string' ? rune : rune?.name || rune?.runa || index}-${index}`}
          rune={rune}
          positionLabel={POSITIONS[index]}
          delayMs={index * 160}
        />
      ))}
    </section>
  );
}
