import React from 'react';
import styles from './SignalConstellation.module.css';

// Posições em % dentro de um container quadrado — topo, direita, base, esquerda.
const POSITIONS = [
  { key: 'tarot', title: 'Tarot', x: 50, y: 12, dir: 'top' },
  { key: 'runes', title: 'Runas', x: 88, y: 50, dir: 'right' },
  { key: 'i_ching', title: 'I Ching', x: 50, y: 88, dir: 'bottom' },
  { key: 'numerology', title: 'Numerologia', x: 12, y: 50, dir: 'left' },
];

export default function SignalConstellation({ signals }) {
  const nodes = POSITIONS
    .map((pos) => ({ ...pos, value: signals?.[pos.key] }))
    .filter((node) => node.value);

  if (nodes.length === 0) return null;

  return (
    <div className={styles.constellation}>
      <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none">
        {nodes.map((node) => (
          <line
            key={node.key}
            x1="50"
            y1="50"
            x2={node.x}
            y2={node.y}
            className={styles.line}
          />
        ))}
      </svg>

      <div className={styles.center}>
        <span className={styles.centerGlyph} aria-hidden="true">✦</span>
        <span className={styles.centerLabel}>síntese</span>
      </div>

      {nodes.map((node) => (
        <div
          key={node.key}
          className={`${styles.node} ${styles[`dir-${node.dir}`]}`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <span className={styles.nodeDot} aria-hidden="true" />
          <h4 className={styles.nodeTitle}>{node.title}</h4>
          <p className={styles.nodeText}>{node.value}</p>
        </div>
      ))}
    </div>
  );
}
