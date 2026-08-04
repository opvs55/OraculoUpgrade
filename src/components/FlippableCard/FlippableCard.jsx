// src/components/FlippableCard/FlippableCard.jsx

import React from 'react';
import styles from './FlippableCard.module.css';

// Este componente recebe a imagem da frente, do verso, e se deve estar virada ou não.
// frontInverted gira só a face da frente (carta invertida na tiragem), sem
// interferir na rotação 3D que faz o flip.
function FlippableCard({ isFlipped, frontImage, backImage, cardName, frontInverted = false }) {
  return (
    <div className={styles.cardScene}>
      <div className={`${styles.card} ${isFlipped ? styles.isFlipped : ''}`}>
        <div className={`${styles.cardFace} ${styles.cardFaceFront}`}>
          <img src={frontImage} alt={cardName} className={frontInverted ? styles.imageInverted : undefined} />
        </div>
        <div className={`${styles.cardFace} ${styles.cardFaceBack}`}>
          <img src={backImage} alt="Verso da Carta" />
        </div>
      </div>
    </div>
  );
}

export default FlippableCard;