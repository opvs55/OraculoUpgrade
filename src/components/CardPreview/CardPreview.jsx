import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './CardPreview.module.css';

const MAX_CONCURRENT_AMBIENT = 2;
const MIN_CHECK_DELAY = 6000;
const MAX_CHECK_DELAY = 16000;
const AMBIENT_DURATION = 4500;
const VISIBLE_RATIO_THRESHOLD = 0.4;
const randomDelay = () => MIN_CHECK_DELAY + Math.random() * (MAX_CHECK_DELAY - MIN_CHECK_DELAY);

// Quantas cartas estão "acordando sozinhas" ao mesmo tempo, na biblioteca
// inteira — estado de módulo simples e compartilhado entre toda instância
// de CardPreview, só pra não deixar mais de MAX_CONCURRENT_AMBIENT vídeos
// tocando de uma vez.
let activeAmbientCount = 0;

// Calcula visibilidade na hora (getBoundingClientRect), em vez de
// IntersectionObserver — mais simples e sem depender de um callback
// assíncrono do navegador pra decidir se anima ou não.
function isMostlyVisible(node, minRatio = VISIBLE_RATIO_THRESHOLD) {
  if (!node) return false;
  const rect = node.getBoundingClientRect();
  if (rect.height <= 0) return false;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
  return Math.max(0, visibleHeight) / rect.height >= minRatio;
}

function CardPreview({ card }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAmbientActive, setIsAmbientActive] = useState(false);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);
  const holdsSlotRef = useRef(false);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // Ritual ambiente: de tempos em tempos, se a carta estiver visível, sem
  // hover, e ainda houver "vaga" no limite global, ela acorda sozinha por
  // alguns segundos e volta a dormir.
  useEffect(() => {
    if (!card.video) return undefined;
    let cancelled = false;

    const releaseSlot = () => {
      if (holdsSlotRef.current) {
        activeAmbientCount = Math.max(0, activeAmbientCount - 1);
        holdsSlotRef.current = false;
      }
    };

    const scheduleCheck = (delay) => {
      timeoutRef.current = setTimeout(tryActivate, delay);
    };

    function tryActivate() {
      if (cancelled) return;
      const visible = isMostlyVisible(containerRef.current);
      if (!visible || isHoveredRef.current || activeAmbientCount >= MAX_CONCURRENT_AMBIENT) {
        scheduleCheck(randomDelay());
        return;
      }
      activeAmbientCount += 1;
      holdsSlotRef.current = true;
      setIsAmbientActive(true);
      timeoutRef.current = setTimeout(() => {
        releaseSlot();
        if (!cancelled) setIsAmbientActive(false);
        scheduleCheck(randomDelay());
      }, AMBIENT_DURATION);
    }

    scheduleCheck(randomDelay());

    return () => {
      cancelled = true;
      clearTimeout(timeoutRef.current);
      releaseSlot();
    };
  }, [card.video]);

  const showVideo = Boolean(card.video) && (isHovered || isAmbientActive);

  return (
    <div ref={containerRef}>
      <Link
        to={`/biblioteca/${card.slug}`}
        className={styles.cardLink}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`${styles.mediaContainer} ${isAmbientActive ? styles.mediaAmbient : ''}`}>
          {showVideo ? (
            <video
              key={card.id}
              className={styles.cardMedia}
              autoPlay
              loop
              muted
              playsInline
              poster={card.img}
              src={card.video}
            />
          ) : (
            <img
              src={card.img}
              alt={card.nome}
              className={styles.cardMedia}
              loading="lazy"
            />
          )}
        </div>
        <p className={styles.cardName}>{card.nome}</p>
      </Link>
    </div>
  );
}

export default CardPreview;
