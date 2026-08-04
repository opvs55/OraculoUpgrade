import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DecorativeDivider from '../../components/common/DecorativeDivider/DecorativeDivider';
import Loader from '../../components/common/Loader/Loader';
import { useAuth } from '../../hooks/useAuth';
import { oraclesApi } from '../../services/api/oraclesApi';
import styles from './FeaturePage.module.css';

export default function YearMapPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const currentYear = new Date().getUTCFullYear();

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

            <div className={styles.sectionBlock}>
              <h3>Suas 12 cartas</h3>
              <div className={styles.monthGrid}>
                {cards.map((card) => {
                  const isPeak = peakMonths.has(card.month);
                  const isChallenge = challengeMonths.has(card.month);
                  const cardClass = [
                    styles.monthCard,
                    isPeak ? styles.peak : '',
                    isChallenge ? styles.challenge : '',
                  ].filter(Boolean).join(' ');

                  return (
                    <div key={card.month} className={cardClass}>
                      <p className={styles.monthLabel}>{card.month_name}</p>
                      <p className={styles.monthCardName}>{card.name}</p>
                      {isPeak && <span className={styles.monthTag}>Auge</span>}
                      {isChallenge && <span className={styles.monthTag}>Desafio</span>}
                    </div>
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
