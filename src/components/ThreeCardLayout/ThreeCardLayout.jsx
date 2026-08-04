// src/components/ThreeCardLayout/ThreeCardLayout.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../Card/Card';
import FlippableCard from '../FlippableCard/FlippableCard';
import { POSICOES_TRES_CARTAS } from '../../constants/tarotConstants';
import styles from './ThreeCardLayout.module.css';

const CARD_BACK_IMAGE = '/assets/cartas/verso.svg';

// Numa leitura recém-revelada (justRevealed), as cartas começam de costas —
// a pessoa toca pra virar, uma a uma. Ao revisitar uma leitura salva, isso
// não faz sentido de novo: mostramos direto, como sempre foi.
function ThreeCardLayout({ cards, basePath, justRevealed = false }) {
  const navigate = useNavigate();
  const threeCards = (cards || []).slice(0, 3);
  const [flipped, setFlipped] = useState(() => threeCards.map(() => false));

  if (!cards || cards.length === 0) return null;

  if (!justRevealed) {
    return (
      <div className={styles.layoutContainer}>
        {threeCards.map((card, index) => {
          const cardPath = `${basePath}/carta/${index + 1}`;
          return (
            <Link to={cardPath} key={card.id || index} className={styles.cardLink}>
              <div className={styles.cardPosition}>
                <Card cardData={card} positionName={POSICOES_TRES_CARTAS[index]} />
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  const handleCardClick = (index) => {
    if (!flipped[index]) {
      setFlipped((prev) => prev.map((value, i) => (i === index ? true : value)));
      return;
    }
    navigate(`${basePath}/carta/${index + 1}`);
  };

  return (
    <div className={styles.layoutContainer}>
      {threeCards.map((card, index) => {
        const isFlipped = flipped[index];
        return (
          <div
            key={card.id || index}
            className={styles.cardPosition}
            style={{ animationDelay: `${index * 0.18}s` }}
          >
            <button
              type="button"
              className={styles.flipTrigger}
              onClick={() => handleCardClick(index)}
              aria-label={isFlipped ? `Ver mais sobre ${card.nome}` : `Revelar carta: ${POSICOES_TRES_CARTAS[index]}`}
            >
              <FlippableCard
                isFlipped={isFlipped}
                frontImage={card.img}
                backImage={CARD_BACK_IMAGE}
                cardName={card.nome}
                frontInverted={card.invertida}
              />
            </button>
            <p className={styles.positionName}>{POSICOES_TRES_CARTAS[index]}</p>
            {isFlipped ? (
              <p className={styles.cardName}>
                {card.nome} {card.invertida ? '(Invertida)' : ''}
              </p>
            ) : (
              <p className={styles.flipHint}>Toque para revelar</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ThreeCardLayout;
