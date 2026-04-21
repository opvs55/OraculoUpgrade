import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { oraclesApi } from '../services/api/oraclesApi';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import DecorativeDivider from '../components/common/DecorativeDivider/DecorativeDivider';
import { getArcanaImageUrl } from '../utils/arcanaMap';
import styles from './DailyOraclePage.module.css';

const CARD_ID_TO_NUMBER = {
  fool: 0, magician: 1, high_priestess: 2, empress: 3, emperor: 4,
  hierophant: 5, lovers: 6, chariot: 7, strength: 8, hermit: 9,
  wheel: 10, wheel_of_fortune: 10, justice: 11, hanged_man: 12, death: 13, temperance: 14,
  devil: 15, tower: 16, star: 17, moon: 18, sun: 19,
  judgement: 20, world: 21,
};

const normalizeCardId = (raw) => {
  if (!raw) return null;
  return String(raw)
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/\s+/g, '_')
    .trim();
};

const CARD_IMG_MAP = {
  0: 'assets/cartas/RWS1909_-_00_Fool.jpeg',
  1: 'assets/cartas/RWS1909_-_01_Magician.jpeg',
  2: 'assets/cartas/RWS1909_-_02_High_Priestess.jpeg',
  3: 'assets/cartas/RWS1909_-_03_Empress.jpeg',
  4: 'assets/cartas/RWS1909_-_04_Emperor.jpeg',
  5: 'assets/cartas/RWS1909_-_05_Hierophant.jpeg',
  6: 'assets/cartas/RWS1909_-_06_Lovers.jpeg',
  7: 'assets/cartas/RWS1909_-_07_Chariot.jpeg',
  8: 'assets/cartas/RWS1909_-_08_Strength.jpeg',
  9: 'assets/cartas/RWS1909_-_09_Hermit.jpeg',
  10: 'assets/cartas/RWS1909_-_10_Wheel_of_Fortune.jpeg',
  11: 'assets/cartas/RWS1909_-_11_Justice.jpeg',
  12: 'assets/cartas/RWS1909_-_12_Hanged_Man.jpeg',
  13: 'assets/cartas/RWS1909_-_13_Death.jpeg',
  14: 'assets/cartas/RWS1909_-_14_Temperance.jpeg',
  15: 'assets/cartas/RWS1909_-_15_Devil.jpeg',
  16: 'assets/cartas/RWS1909_-_16_Tower.jpeg',
  17: 'assets/cartas/RWS1909_-_17_Star.jpeg',
  18: 'assets/cartas/RWS1909_-_18_Moon.jpeg',
  19: 'assets/cartas/RWS1909_-_19_Sun.jpeg',
  20: 'assets/cartas/RWS1909_-_20_Judgement.jpeg',
  21: 'assets/cartas/RWS1909_-_21_World.jpeg',
};

const todayStr = () => new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

export default function DailyOraclePage() {
  usePageTitle('Carta do Dia');
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['daily-oracle', user?.id],
    enabled: !!user?.id,
    queryFn: () => oraclesApi.getDailyOracle(),
    staleTime: 1000 * 60 * 60,
  });

  const normalizedId = normalizeCardId(data?.card_id);
  const cardNumber = normalizedId != null ? CARD_ID_TO_NUMBER[normalizedId] : undefined;
  const imgPath = cardNumber != null ? CARD_IMG_MAP[cardNumber] : null;
  const imgUrl = imgPath ? getArcanaImageUrl(imgPath) : null;

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Tarot · Arcanos Maiores</p>
        <h1>Carta do Dia</h1>
        <p className={styles.subtitle}>{todayStr()}</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        {isLoading && (
          <div className={styles.loadingBlock}>
            <div className={styles.cardGhost} />
            <p className={styles.loadingHint}>Consultando os arcanos…</p>
          </div>
        )}

        {error && (
          <div className={styles.errorCard}>
            <h2>Não foi possível carregar</h2>
            <p>O oráculo do dia está indisponível no momento.</p>
            <button type="button" className={styles.primaryButton} onClick={() => refetch()}>
              Tentar novamente
            </button>
          </div>
        )}

        {data && (
          <div className={styles.oracleLayout}>
            <div className={styles.cardArt}>
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={data.card_name}
                  className={styles.cardImage}
                />
              ) : (
                <div className={styles.cardFrame}>
                  <p className={styles.cardName}>{data.card_name}</p>
                </div>
              )}
            </div>

            <div className={styles.cardContent}>
              <div className={styles.statusRow}>
                <span className={styles.badge}>{data.card_name}</span>
              </div>
              <p className={styles.sectionLabel}>Mensagem de Hoje</p>
              {data.interpretation ? (
                <p className={styles.interpretation}>{data.interpretation}</p>
              ) : (
                <p className={styles.interpretationEmpty}>Carregando mensagem…</p>
              )}
              <div className={styles.actions}>
                <Link to="/oraculo/geral" className={styles.primaryButton}>
                  Ver Síntese da Semana →
                </Link>
                <Link to="/tarot" className={styles.secondaryButton}>
                  Fazer uma tiragem completa
                </Link>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className={styles.guestBox}>
            <p className={styles.guestTitle}>Receba sua carta diária</p>
            <p className={styles.guestDesc}>Crie uma conta para receber uma carta personalizada todos os dias e acompanhar sua jornada.</p>
            <Link to="/cadastro" className={styles.primaryButton}>Criar conta gratuitamente</Link>
          </div>
        )}
      </section>
    </div>
  );
}
