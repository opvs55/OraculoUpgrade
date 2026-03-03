import React, { useMemo } from 'react';
import { resolveRune } from '../../constants/runes';
import styles from './RuneStone.module.css';

const POSITION_LABELS = {
  passado: 'Passado',
  presente: 'Presente',
  futuro: 'Futuro',
};

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

export default function RuneStone({ rune, position, delayMs = 0 }) {
  const resolvedRune = useMemo(
    () => resolveRune(rune?.key || rune?.name || rune?.symbol || rune),
    [rune],
  );

  const keywords = useMemo(() => {
    const rawKeywords = Array.isArray(rune?.keywords) && rune.keywords.length > 0
      ? rune.keywords
      : resolvedRune.keywords;

    return Array.isArray(rawKeywords) ? rawKeywords.filter(Boolean).slice(0, 3) : [];
  }, [rune, resolvedRune]);

  const positionLabel = POSITION_LABELS[normalizePosition(position)] || POSITION_LABELS.presente;

  return (
    <article className={styles.stone} style={{ '--delay-ms': `${delayMs}ms` }}>
      <span className={styles.positionBadge}>{positionLabel}</span>
      <div className={styles.symbolWrap}>
        <span className={styles.symbol}>{resolvedRune.symbol}</span>
      </div>
      {resolvedRune.name && <p className={styles.name}>{resolvedRune.name}</p>}
      {keywords.length > 0 && <p className={styles.keywords}>{keywords.join(' • ')}</p>}
    </article>
  );
}
