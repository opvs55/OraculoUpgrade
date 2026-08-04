import React from 'react';
import styles from './EnergyTrend.module.css';

const WIDTH = 100;
const HEIGHT = 34;
const PADDING_Y = 5;

const getScore = (reading) =>
  reading?.energy_score ?? reading?.final_reading?.energy_score ?? reading?.finalReading?.energy_score;

// Sparkline simples via <polyline> — sem path data manual, só pontos calculados.
export default function EnergyTrend({ readings }) {
  const points = (Array.isArray(readings) ? readings : [])
    .map((reading) => ({ score: getScore(reading), weekRef: reading?.week_ref || reading?.weekRef }))
    .filter((item) => Number.isFinite(item.score))
    .reverse(); // mais antiga -> mais recente, pra ler da esquerda pra direita

  if (points.length < 2) return null;

  const usableHeight = HEIGHT - PADDING_Y * 2;
  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * WIDTH;
    const y = HEIGHT - PADDING_Y - (point.score / 100) * usableHeight;
    return { ...point, x, y };
  });

  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPoints = `0,${HEIGHT} ${linePoints} ${WIDTH},${HEIGHT}`;
  const last = coords[coords.length - 1];
  const first = points[0].score;
  const trendDelta = last.score - first;

  return (
    <div className={styles.trend}>
      <div className={styles.trendHead}>
        <span className={styles.trendLabel}>Energia ao longo do tempo</span>
        <span className={`${styles.trendDelta} ${trendDelta >= 0 ? styles.up : styles.down}`}>
          {trendDelta >= 0 ? '↗' : '↘'} {Math.abs(trendDelta)} pts desde a primeira leitura
        </span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className={styles.svg}>
        <polygon points={areaPoints} className={styles.area} />
        <polyline points={linePoints} className={styles.line} />
        <circle cx={last.x} cy={last.y} r="2.2" className={styles.dot} />
      </svg>
    </div>
  );
}
