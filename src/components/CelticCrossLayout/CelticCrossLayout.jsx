// src/components/CelticCrossLayout/CelticCrossLayout.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../Card/Card';
import { POSICOES_CRUZ_CELTA } from '../../constants/tarotConstants';
import styles from './CelticCrossLayout.module.css';

// A função agora aceita a prop 'basePath' para criar links dinâmicos
function CelticCrossLayout({ cards, basePath = '/resultado' }) {
  
  if (!cards || cards.length === 0) return null;

  const centerCards = cards.slice(0, 2);
  const otherCards = cards.slice(2);

  const centerCard = centerCards[0];
  const crossCard  = centerCards[1];

  return (
    <div className={styles.gridContainer}>

      {/* Posições 1+2 num wrapper compartilhado no mesmo grid-area */}
      <div className={styles.centerWrapper}>
        {/* Posição 1 - Situação Atual */}
        <Link to={`${basePath}/carta/1`} className={styles.centerCardLink}>
          <div className={styles.centerCardInner}>
            <Card cardData={centerCard} positionName={POSICOES_CRUZ_CELTA[0]} />
          </div>
        </Link>

        {/* Posição 2 - Desafio (carta deitada sobreposta) */}
        {crossCard && (() => {
          const { nome, img, invertida } = crossCard;
          return (
            <>
              <Link to={`${basePath}/carta/2`} className={styles.crossedCardLink}>
                <img
                  src={img}
                  alt={nome}
                  className={`${styles.crossedCardImg} ${invertida ? styles.crossedCardImgInverted : ''}`}
                />
              </Link>
              <div className={styles.crossedLabels}>
                <p className={styles.crossedPositionName}>{POSICOES_CRUZ_CELTA[1]}</p>
                <p className={styles.crossedCardName}>{nome}{invertida ? ' (Invertida)' : ''}</p>
              </div>
            </>
          );
        })()}
      </div>

      {/* Demais posições (3–10) */}
      {otherCards.map((card, i) => {
        const index = i + 2;
        const cardPath = `${basePath}/carta/${index + 1}`;
        return (
          <Link to={cardPath} key={card.id || index} className={styles.cardLink}>
            <div className={`${styles.cardPosition} ${styles[`position${index + 1}`]}`}>
              <Card cardData={card} positionName={POSICOES_CRUZ_CELTA[index]} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default CelticCrossLayout;