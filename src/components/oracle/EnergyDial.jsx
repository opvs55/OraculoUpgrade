import React from 'react';
import styles from './EnergyDial.module.css';

// Anel de progresso via stroke-dasharray/stroke-dashoffset — evita desenhar
// arco manualmente com path data, mais simples e sem casos de borda em 0/100.
const SIZE = 132;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const energyLabel = (score) => {
  if (score >= 75) return 'Energia alta';
  if (score >= 45) return 'Energia em equilíbrio';
  return 'Energia pede cuidado';
};

export default function EnergyDial({ score }) {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className={styles.dial}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.svg}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          className={styles.track}
          strokeWidth={STROKE}
          fill="none"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          className={styles.progress}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
        <text x="50%" y="47%" textAnchor="middle" className={styles.scoreText}>
          {clamped}
        </text>
        <text x="50%" y="64%" textAnchor="middle" className={styles.scoreUnit}>
          /100
        </text>
      </svg>
      <p className={styles.label}>{energyLabel(clamped)}</p>
    </div>
  );
}
