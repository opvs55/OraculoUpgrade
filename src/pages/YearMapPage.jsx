import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { oraclesApi } from '../services/api/oraclesApi';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import DecorativeDivider from '../components/common/DecorativeDivider/DecorativeDivider';
import { getArcanaImageUrl } from '../utils/arcanaMap';
import styles from './YearMapPage.module.css';

const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const CURRENT_MONTH = new Date().getMonth() + 1;
const CURRENT_YEAR = new Date().getFullYear();

export default function YearMapPage() {
  usePageTitle('Mapa do Ano');
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);

  const { data, isLoading, error } = useQuery({
    queryKey: ['year-map', user?.id, CURRENT_YEAR],
    enabled: !!user?.id,
    queryFn: () => oraclesApi.getYearMap(CURRENT_YEAR),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const cards = data?.cards_data || [];
  const overview = data?.final_reading;
  const selectedCard = cards.find(c => c.month === selectedMonth);

  const selectedCardImgUrl = selectedCard?.img_path
    ? getArcanaImageUrl(selectedCard.img_path)
    : selectedCard?.name
    ? (() => {
        const CARD_NAME_TO_IMG = {
          'O Louco': 'assets/cartas/RWS1909_-_00_Fool.jpeg',
          'O Mago': 'assets/cartas/RWS1909_-_01_Magician.jpeg',
          'A Sacerdotisa': 'assets/cartas/RWS1909_-_02_High_Priestess.jpeg',
          'A Imperatriz': 'assets/cartas/RWS1909_-_03_Empress.jpeg',
          'O Imperador': 'assets/cartas/RWS1909_-_04_Emperor.jpeg',
          'O Hierofante': 'assets/cartas/RWS1909_-_05_Hierophant.jpeg',
          'Os Amantes': 'assets/cartas/RWS1909_-_06_Lovers.jpeg',
          'O Carro': 'assets/cartas/RWS1909_-_07_Chariot.jpeg',
          'A Força': 'assets/cartas/RWS1909_-_08_Strength.jpeg',
          'O Eremita': 'assets/cartas/RWS1909_-_09_Hermit.jpeg',
          'A Roda da Fortuna': 'assets/cartas/RWS1909_-_10_Wheel_of_Fortune.jpeg',
          'A Justiça': 'assets/cartas/RWS1909_-_11_Justice.jpeg',
          'O Enforcado': 'assets/cartas/RWS1909_-_12_Hanged_Man.jpeg',
          'A Morte': 'assets/cartas/RWS1909_-_13_Death.jpeg',
          'A Temperança': 'assets/cartas/RWS1909_-_14_Temperance.jpeg',
          'O Diabo': 'assets/cartas/RWS1909_-_15_Devil.jpeg',
          'A Torre': 'assets/cartas/RWS1909_-_16_Tower.jpeg',
          'A Estrela': 'assets/cartas/RWS1909_-_17_Star.jpeg',
          'A Lua': 'assets/cartas/RWS1909_-_18_Moon.jpeg',
          'O Sol': 'assets/cartas/RWS1909_-_19_Sun.jpeg',
          'O Julgamento': 'assets/cartas/RWS1909_-_20_Judgement.jpeg',
          'O Mundo': 'assets/cartas/RWS1909_-_21_World.jpeg',
        };
        const path = CARD_NAME_TO_IMG[selectedCard.name];
        return path ? getArcanaImageUrl(path) : null;
      })()
    : null;

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
