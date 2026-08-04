import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DecorativeDivider from '../../components/common/DecorativeDivider/DecorativeDivider';
import Loader from '../../components/common/Loader/Loader';
import { useAuth } from '../../hooks/useAuth';
import { oraclesApi } from '../../services/api/oraclesApi';
import { resolveTarotCardImage } from '../../utils/resolveTarotCardImage';
import { baralho } from '../../tarotDeck';
import styles from './FeaturePage.module.css';

export default function YearMapPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const currentYear = new Date().getUTCFullYear();
  const currentMonthNumber = new Date().getUTCMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(null);

  const query = useQuery({
    queryKey: ['oracles', 'year-map', userId, currentYear],
    queryFn: () => oraclesApi.getYearMap(currentYear),
    enabled: !!userId,
  });

  const data = query.data;
  const finalReading = data?.final_reading;
  const cards = Array.isArray(data?.cards_data) ? data.cards_data : [];
  const peakMonths = new Set(finalReading?.peak_months || []);
  const challengeMonths = new Set(finalReading?.challenge_months || []);

  const activeMonth = selectedMonth ?? currentMonthNumber;
  const activeCard = cards.find((c) => c.month === activeMonth) || cards[0];
  const activeCardInfo = activeCard ? baralho.find((c) => c.nome === activeCard.name) : null;
  const otherCards = cards.filter((c) => c.month !== activeCard?.month);

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Tarot</p>
        <h1>Mapa do Ano {currentYear}</h1>
        <p className={styles.subtitle}>Uma carta por mês revelando os grandes movimentos do seu ano.</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        {query.isLoading && <Loader />}

        {query.isError && (
          <div className={styles.errorCard}>
            <h2>Falha ao carregar o Mapa do Ano</h2>
            <p>{query.error?.message || 'Não foi possível carregar seu mapa anual.'}</p>
            <button type="button" className={styles.primaryButton} onClick={() => query.refetch()}>
              Tentar novamente
            </button>
          </div>
        )}

        {!query.isLoading && !query.isError && data && (
          <div className={styles.resultCard}>
            {finalReading ? (
              <div className={styles.messageCard}>
                <h2>{finalReading.headline}</h2>
                <p>{finalReading.overview}</p>
                {finalReading.year_theme && (
                  <p><strong>Tema do ano:</strong> {finalReading.year_theme}</p>
                )}
              </div>
            ) : (
              <div className={styles.messageCard}>
                <h2>Mapa em construção</h2>
                <p>As 12 cartas já foram sorteadas — a síntese do ano ainda está sendo preparada.</p>
              </div>
            )}

            {activeCard && (
              <div className={styles.sectionBlock}>
                <h3>
                  {activeCard.month_name}
                  {activeCard.month === currentMonthNumber ? ' · Mês atual' : ''}
                </h3>
                <div className={styles.monthSpotlight}>
                  {resolveTarotCardImage(activeCard.name) && (
                    <img
                      src={resolveTarotCardImage(activeCard.name)}
                      alt={activeCard.name}
                      className={styles.monthSpotlightImage}
                    />
                  )}
                  <div className={styles.monthSpotlightContent}>
                    <p className={styles.monthCardName}>{activeCard.name}</p>
                    <div className={styles.chipsRow}>
                      {peakMonths.has(activeCard.month) && <span className={styles.tagPeak}>Auge do ano</span>}
                      {challengeMonths.has(activeCard.month) && <span className={styles.tagChallenge}>Desafio</span>}
                      {activeCardInfo?.palavras_chave?.direito?.slice(0, 3).map((word) => (
                        <span key={word} className={styles.themeChip}>{word}</span>
                      ))}
                    </div>
                    {activeCardInfo && (
                      <>
                        <p>{activeCardInfo.significados?.direito || activeCardInfo.descricao}</p>
                        <Link to={`/biblioteca/${activeCardInfo.slug}`} className={styles.aboutLink}>
                          Ver significado completo →
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.sectionBlock}>
              <h3>As outras cartas do ano</h3>
              <div className={styles.monthGrid}>
                {otherCards.map((card) => {
                  const isPeak = peakMonths.has(card.month);
                  const isChallenge = challengeMonths.has(card.month);
                  const cardClass = [
                    styles.monthCard,
                    isPeak ? styles.peak : '',
                    isChallenge ? styles.challenge : '',
                  ].filter(Boolean).join(' ');
                  const thumb = resolveTarotCardImage(card.name);

                  return (
                    <button
                      key={card.month}
                      type="button"
                      className={cardClass}
                      onClick={() => setSelectedMonth(card.month)}
                    >
                      {thumb && <img src={thumb} alt={card.name} className={styles.monthCardThumb} />}
                      <p className={styles.monthLabel}>{card.month_name}</p>
                      <p className={styles.monthCardName}>{card.name}</p>
                      {isPeak && <span className={styles.monthTag}>Auge</span>}
                      {isChallenge && <span className={styles.monthTag}>Desafio</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
