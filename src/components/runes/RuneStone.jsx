import React, { useMemo } from 'react';
import styles from './RuneStone.module.css';

const RUNE_SYMBOL_MAP = {
  fehu: 'ᚠ',
  uruz: 'ᚢ',
  thurisaz: 'ᚦ',
  ansuz: 'ᚨ',
  raidho: 'ᚱ',
  kenaz: 'ᚲ',
  gebo: 'ᚷ',
  wunjo: 'ᚹ',
  hagalaz: 'ᚺ',
  naudhiz: 'ᚾ',
  isa: 'ᛁ',
  jera: 'ᛃ',
  eihwaz: 'ᛇ',
  perthro: 'ᛈ',
  algiz: 'ᛉ',
  sowilo: 'ᛋ',
  tiwaz: 'ᛏ',
  berkano: 'ᛒ',
  ehwaz: 'ᛖ',
  mannaz: 'ᛗ',
  laguz: 'ᛚ',
  ingwaz: 'ᛜ',
  dagaz: 'ᛞ',
  othala: 'ᛟ',
};

const toKey = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

const getSymbol = (rune) => {
  if (!rune) return 'ᛟ';

  if (typeof rune === 'string') {
    if (/^[\u16A0-\u16FF]$/.test(rune.trim())) return rune.trim();
    return RUNE_SYMBOL_MAP[toKey(rune)] || rune.trim().charAt(0).toUpperCase();
  }

  const directSymbol = rune?.symbol || rune?.unicode || rune?.glyph;
  if (directSymbol && /^[\u16A0-\u16FF]$/.test(String(directSymbol).trim())) return String(directSymbol).trim();

  const name = rune?.name || rune?.nome || rune?.rune || rune?.runa;
  return RUNE_SYMBOL_MAP[toKey(name)] || 'ᛟ';
};

const getName = (rune) => {
  if (!rune) return null;
  if (typeof rune === 'string') return /^[\u16A0-\u16FF]$/.test(rune.trim()) ? null : rune;
  return rune?.name || rune?.nome || rune?.rune || rune?.runa || null;
};

const getKeywords = (rune) => {
  if (!rune || typeof rune === 'string') return [];
  const raw = rune?.keywords || rune?.temas || rune?.themes;
  if (Array.isArray(raw)) return raw.filter(Boolean).slice(0, 3);
  if (typeof raw === 'string') return raw.split(/,|;|\//).map((item) => item.trim()).filter(Boolean).slice(0, 3);
  return [];
};

export default function RuneStone({ rune, delayMs = 0, positionLabel }) {
  const symbol = useMemo(() => getSymbol(rune), [rune]);
  const name = useMemo(() => getName(rune), [rune]);
  const keywords = useMemo(() => getKeywords(rune), [rune]);

  return (
    <article className={styles.stone} style={{ '--delay-ms': `${delayMs}ms` }}>
      {positionLabel && <p className={styles.position}>{positionLabel}</p>}
      <div className={styles.symbolWrap}>
        <span className={styles.symbol}>{symbol}</span>
      </div>
      {name && <p className={styles.name}>{name}</p>}
      {keywords.length > 0 && <p className={styles.keywords}>{keywords.join(' • ')}</p>}
    </article>
  );
}
