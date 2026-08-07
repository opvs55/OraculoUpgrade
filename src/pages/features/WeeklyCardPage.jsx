import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DecorativeDivider from '../../components/common/DecorativeDivider/DecorativeDivider';
import Loader from '../../components/common/Loader/Loader';
import FlippableCard from '../../components/FlippableCard/FlippableCard';
import { useAuth } from '../../hooks/useAuth';
import { useWeeklyCard } from '../../hooks/useWeeklyCard';
import { resolveTarotCardImage } from '../../utils/resolveTarotCardImage';
import styles from './FeaturePage.module.css';
import hero from './CartaDoDiaPage.module.css';

const CARD_BACK_IMAGE = '/assets/cartas/verso.svg';

export default function WeeklyCardPage() {
  const { user } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);

  const {
    weekStart,
    weeklyRecord,
    cardDetails,
    revealAllowed,
    revealCard,
    isRevealing,
    isSessionLoading,
    errorMessage,
    weeklyMessage,
    isGeneratingMessage,
  } = useWeeklyCard(user?.id);

  const cardImage = cardDetails ? resolveTarotCardImage(cardDetails.nome) : null;
  const keywords = cardDetails?.palavras_chave?.direito?.slice(0, 4) || [];

  // Mesmo ritmo da Carta do Dia — a carta chega de costas e se revela
  // sozinha pouco depois de aparecer, em vez de tudo estático de uma vez.
  useEffect(() => {
    setIsFlipped(false);
    if (!weeklyRecord) return;
    const timer = setTimeout(() => setIsFlipped(true), 500);
    return () => clearTimeout(timer);
  }, [weeklyRecord?.id]);

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Oráculos</p>
        <h1>Carta da Semana</h1>
        <p className={styles.subtitle}>Um portal único — uma mensagem para atravessar seus próximos dias.</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        {isSessionLoading && <Loader />}

        {!isSessionLoading && !weeklyRecord && (
          <div className={styles.resultCard}>
            <div className={hero.stage}>
              <div className={hero.glow} />
              <div className={hero.cardFrame}>
                <img src={CARD_BACK_IMAGE} alt="Verso da carta" style={{ width: '100%', borderRadius: 8, display: 'block' }} />
              </div>
              <p className={hero.cardLabel}>Semana de {weekStart}</p>
            </div>
            <p>Respire fundo, alinhe sua intenção e permita que uma única carta revele a energia da sua semana.</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={revealCard}
              disabled={!revealAllowed || isRevealing}
            >
              {isRevealing ? 'Revelando...' : 'Revelar minha carta da semana'}
            </button>
            {errorMessage && <p className={styles.inlineError}>{errorMessage}</p>}
          </div>
        )}

        {weeklyRecord && cardDetails && (
          <div className={styles.resultCard}>
            <div className={styles.statusRow}>
              <span className={styles.badge}>Semana de {weekStart}</span>
            </div>

            <div className={hero.stage}>
              <div className={hero.glow} />
              <div className={hero.cardFrame}>
                <FlippableCard
                  isFlipped={isFlipped}
                  frontImage={cardImage}
                  backImage={CARD_BACK_IMAGE}
                  cardName={cardDetails.nome}
                />
              </div>
              <p className={hero.cardLabel}>{cardDetails.nome}</p>
            </div>

            {keywords.length > 0 && (
              <div className={styles.chipsRow}>
                {keywords.map((word) => (
                  <span key={word} className={styles.themeChip}>{word}</span>
                ))}
              </div>
            )}

            <div className={styles.factGrid}>
              <div className={styles.factCard}>
                <h4 className={styles.factCardLabel}>Para sua semana</h4>
                <p>
                  {isGeneratingMessage
                    ? 'Preparando sua mensagem...'
                    : (weeklyMessage || 'Observe os sinais da semana e registre suas emoções mais claras.')}
                </p>
              </div>
            </div>

            {cardDetails.descricao && (
              <div className={styles.sectionBlock}>
                <h3>Sobre {cardDetails.nome}</h3>
                <p>{cardDetails.descricao}</p>
                <Link to={`/biblioteca/${cardDetails.slug}`} className={styles.aboutLink}>
                  Ver significado completo →
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
