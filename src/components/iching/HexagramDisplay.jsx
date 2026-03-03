import React from 'react';
import styles from './HexagramDisplay.module.css';

const parseLine = (line) => {
  if (line === 1 || line === '1' || line === true) return 'yang';
  if (line === 0 || line === '0' || line === false) return 'yin';

  const value = String(line || '').toLowerCase();
  if (value.includes('yang') || value.includes('inteira') || value.includes('solid')) return 'yang';
  return 'yin';
};

export default function HexagramDisplay({ lines = [] }) {
  if (!Array.isArray(lines) || lines.length !== 6) {
    return null;
  }

  const topToBottom = [...lines].reverse();

  return (
    <section className={styles.hexagram} aria-label="Hexagrama semanal">
      {topToBottom.map((line, visualIndex) => {
        const type = parseLine(line);
        return (
          <div
            key={`line-${visualIndex}`}
            className={styles.hexLine}
            style={{ '--line-delay-ms': `${visualIndex * 140}ms` }}
          >
            {type === 'yang' ? (
              <span className={`${styles.segment} ${styles.full}`} />
            ) : (
              <>
                <span className={`${styles.segment} ${styles.half}`} />
                <span className={styles.gap} />
                <span className={`${styles.segment} ${styles.half}`} />
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}
