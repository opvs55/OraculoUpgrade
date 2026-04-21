import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { oraclesApi } from '../services/api/oraclesApi';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import DecorativeDivider from '../components/common/DecorativeDivider/DecorativeDivider';
import { getArcanaImageUrl, MAJOR_ARCANA } from '../utils/arcanaMap';
import styles from './YearMapPage.module.css';

const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();

export default function YearMapPage() {
  usePageTitle('Mapa do Ano');
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['year-map', user?.id, CURRENT_YEAR],
    enabled: !!user?.id,
    queryFn: () => oraclesApi.getYearMap(CURRENT_YEAR),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const getCardKeyword = (cardName) => {
    const arcana = MAJOR_ARCANA.find(a => a.name === cardName);
    return arcana?.keyword || null;
  };

  const cards = data?.cards_data || [];
  const overview = data?.final_reading;
  const selectedCard = cards.find(c => c.month === selectedMonth);

  const resolveCardImg = (card) => {
    if (!card) return null;
    if (card.img_path) return getArcanaImageUrl(card.img_path);
    const arcana = MAJOR_ARCANA.find(a => a.name === card.name);
    return arcana ? getArcanaImageUrl(arcana.img) : null;
  };

  const selectedCardImgUrl = resolveCardImg(selectedCard);

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Tarot · Arcanos Maiores</p>
        <h1>Mapa do Ano {CURRENT_YEAR}</h1>
        <p className={styles.subtitle}>12 cartas — uma para cada mês da sua jornada anual.</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        {isLoading && (
          <div className={styles.loadingBlock}>
            <p className={styles.loadingHint}>Sorteando os arcanos do ano…</p>
          </div>
        )}
        {error && (
          <div className={styles.errorCard}>
            <h2>Erro ao carregar</h2>
            <p>Não foi possível carregar o Mapa do Ano.</p>
            <button type="button" className={styles.primaryButton} onClick={() => refetch()}>Tentar novamente</button>
          </div>
        )}

        {data && (
          <>
            {overview && (
              <div className={styles.overviewCard}>
                <p className={styles.sectionLabel}>Visão Geral</p>
                {overview.headline && <h2 className={styles.overviewHeadline}>{overview.headline}</h2>}
                {overview.year_theme && <span className={styles.yearTheme}>{overview.year_theme}</span>}
                {overview.overview && <p className={styles.overviewText}>{overview.overview}</p>}
              </div>
            )}

            <div className={styles.monthGrid}>
              {cards.map(card => (
                <button
                  key={card.month}
                  className={`${styles.monthCell} ${selectedMonth === card.month ? styles.monthCellActive : ''} ${card.month === CURRENT_MONTH ? styles.monthCellCurrent : ''}`}
                  onClick={() => setSelectedMonth(card.month)}
                  type="button"
                >
                  <span className={styles.monthAbbr}>{MONTH_NAMES[card.month - 1]}</span>
                  <span className={styles.monthCardName}>{card.name}</span>
                </button>
              ))}
            </div>

            {selectedCard && (
              <div className={styles.cardDetail}>
                <div className={styles.cardDetailHeader}>
                  <div className={styles.cardDetailArt}>
                    {selectedCardImgUrl ? (
                      <img
                        key={selectedCard.month}
                        src={selectedCardImgUrl}
                        alt={selectedCard.name}
                        className={styles.cardDetailImage}
                      />
                    ) : (
                      <div className={styles.cardDetailFrame}>
                        <span className={styles.cardDetailMonth}>{selectedCard.month_name}</span>
                        <span className={styles.cardDetailName}>{selectedCard.name}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardDetailInfo}>
                    <p className={styles.sectionLabel}>Carta do mês</p>
                    <h3 className={styles.cardDetailTitle}>{selectedCard.name}</h3>
                    {getCardKeyword(selectedCard.name) && (
                      <span className={styles.cardKeyword}>{getCardKeyword(selectedCard.name)}</span>
                    )}
                    <p className={styles.cardDetailHint}>
                      {selectedCard.month < CURRENT_MONTH
                        ? 'Mês passado — reflita sobre como essa energia se manifestou.'
                        : selectedCard.month === CURRENT_MONTH
                        ? 'Este é o seu mês atual. Trabalhe com essa energia conscientemente.'
                        : 'Mês futuro — prepare-se para essa vibração com antecedência.'}
                    </p>
                    <Link to="/tarot" className={styles.primaryButton}>
                      Fazer uma tiragem sobre este mês →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {overview?.peak_months?.length > 0 && (
              <div className={styles.highlights}>
                <div className={styles.highlightItem}>
                  <p className={styles.sectionLabel}>Meses de pico</p>
                  <p className={styles.highlightMonths}>
                    {overview.peak_months.map(m => MONTH_NAMES[m - 1]).join(' · ')}
                  </p>
                </div>
                {overview.challenge_months?.length > 0 && (
                  <div className={styles.highlightItem}>
                    <p className={styles.sectionLabel}>Meses de desafio</p>
                    <p className={styles.highlightMonths}>
                      {overview.challenge_months.map(m => MONTH_NAMES[m - 1]).join(' · ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!user && (
          <div className={styles.guestBox}>
            <p className={styles.guestTitle}>Conheça seu Mapa Anual</p>
            <p className={styles.guestDesc}>Crie uma conta para revelar as 12 cartas do seu ano e receber orientação mês a mês.</p>
            <Link to="/cadastro" className={styles.primaryButton}>Criar conta gratuitamente</Link>
          </div>
        )}
      </section>
    </div>
  );
}
