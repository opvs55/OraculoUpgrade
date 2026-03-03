import React, { useMemo } from 'react';
import RuneStone from './RuneStone';
import styles from './RunesCast.module.css';

const POSITION_FALLBACK = ['passado', 'presente', 'futuro'];

const normalizePosition = (value) => {
  const raw = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (raw.startsWith('pass')) return 'passado';
  if (raw.startsWith('pres')) return 'presente';
  if (raw.startsWith('fut')) return 'futuro';
  return null;
};

const normalizeRunes = (runes) => {
  if (!Array.isArray(runes)) return [];

  return runes
    .filter((item) => item !== null && item !== undefined && item !== '')
    .slice(0, 3)
    .map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return {
          rune: item,
          position: normalizePosition(item.position) || POSITION_FALLBACK[index],
        };
      }

      return {
        rune: item,
        position: POSITION_FALLBACK[index],
      };
    });
};

export default function RunesCast({ runes = [] }) {
  const normalizedRunes = useMemo(() => normalizeRunes(runes), [runes]);

  if (normalizedRunes.length === 0) {
    return null;
  }

  return (
    <section className={styles.cast} aria-label="Lançamento de runas da semana">
      {normalizedRunes.map(({ rune, position }, index) => (
        <RuneStone
          key={`${typeof rune === 'string' ? rune : rune?.key || rune?.name || rune?.symbol || index}-${index}`}
          rune={rune}
          position={position}
          delayMs={index * 140}
        />
      ))}
    </section>
  );
}
