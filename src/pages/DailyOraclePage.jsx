import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { oraclesApi } from '../services/api/oraclesApi';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import styles from './DailyOraclePage.module.css';

const CARD_SYMBOLS = {
  fool: '0', magician: 'I', high_priestess: 'II', empress: 'III', emperor: 'IV',
  hierophant: 'V', lovers: 'VI', chariot: 'VII', strength: 'VIII', hermit: 'IX',
  wheel: 'X', justice: 'XI', hanged_man: 'XII', death: 'XIII', temperance: 'XIV',
  devil: 'XV', tower: 'XVI', star: 'XVII', moon: 'XVIII', sun: 'XIX',
  judgement: 'XX', world: 'XXI',
};

const todayStr = () => new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

export default function DailyOraclePage() {
  usePageTitle('Oráculo do Dia');
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['daily-oracle', user?.id],
    enabled: !!user?.id,
    queryFn: () => oraclesApi.getDailyOracle(),
    staleTime: 1000 * 60 * 60,
  });

  return (
    <div className={`content_wrapper ${styles.pageContainer}`}>
      <div className={styles.content}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Oráculo do Dia</p>
          <h1 className={styles.title}>Sua Carta de Hoje</h1>
          <p className={styles.dateLabel}>{todayStr()}</p>
        </header>

        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.cardGhost} />
            <p>Consultando os arcanos...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorBox}>
            <p>Não foi possível carregar o oráculo do dia.</p>
            <Link to="/perfil" className={styles.backLink}>Voltar ao perfil</Link>
          </div>
        )}

        {data && (
          <div className={styles.oracleLayout}>
            <div className={styles.cardArt}>
              <div className={styles.cardFrame}>
                <span className={styles.cardRoman}>{CARD_SYMBOLS[data.card_id] || '?'}</span>
                <p className={styles.cardName}>{data.card_name}</p>
              </div>
            </div>

            <div className={styles.cardContent}>
              <p className={styles.sectionLabel}>Mensagem de Hoje</p>
              {data.interpretation ? (
                <p className={styles.interpretation}>{data.interpretation}</p>
              ) : (
                <p className={styles.interpretationEmpty}>Carregando mensagem...</p>
              )}

              <div className={styles.actions}>
                <Link to="/oraculo/geral" className={styles.ctaButton}>
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
            <Link to="/cadastro" className={styles.ctaButton}>Criar conta gratuitamente</Link>
          </div>
        )}
      </div>
    </div>
  );
}
