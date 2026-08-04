import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DecorativeDivider from '../../components/common/DecorativeDivider/DecorativeDivider';
import Loader from '../../components/common/Loader/Loader';
import FlippableCard from '../../components/FlippableCard/FlippableCard';
import { useAuth } from '../../hooks/useAuth';
import { oraclesApi } from '../../services/api/oraclesApi';
import { resolveTarotCardImage } from '../../utils/resolveTarotCardImage';
import { baralhoDetalhado } from '../../tarotDeck';
import styles from './FeaturePage.module.css';

const CARD_BACK_IMAGE = '/assets/cartas/verso.svg';

const formatOracleDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const formatted = new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// A mensagem vem como JSON serializado (nome_do_dia, mensagem,
// intencao_pratica) — mas leituras antigas ou uma falha da IA podem ter
// deixado só texto solto. Tenta o formato novo, cai pro texto puro.
const parseInterpretation = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.mensagem) return parsed;
  } catch {
    // formato antigo: texto simples
  }
  return { mensagem: raw };
};

export default function CartaDoDiaPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [isFlipped, setIsFlipped] = useState(false);

  const query = useQuery({
    queryKey: ['oracles', 'daily-oracle', userId],
    queryFn: () => oraclesApi.getDailyOracle(),
    enabled: !!userId,
  });

  const data = query.data;
  const cardImage = data ? resolveTarotCardImage(data.card_name) : null;
  const cardInfo = data ? baralhoDetalhado.find((card) => card.nome === data.card_name) : null;
  const keywords = cardInfo?.palavras_chave?.direito?.slice(0, 4) || [];
  const message = parseInterpretation(data?.interpretation);

  // A carta chega de costas e se revela sozinha pouco depois de carregar —
  // um pequeno momento de pausa antes da mensagem do dia, em vez de tudo
  // aparecer estático de uma vez.
  useEffect(() => {
    setIsFlipped(false);
    if (!data) return;
    const timer = setTimeout(() => setIsFlipped(true), 500);
    return () => clearTimeout(timer);
  }, [data?.oracle_date, data?.card_name]);

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Oráculos</p>
        <h1>Carta do Dia</h1>
        <p className={styles.subtitle}>Uma única carta pra abrir o dia com intenção.</p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        {query.isLoading && <Loader />}

        {query.isError && (
          <div className={styles.errorCard}>
            <h2>Falha ao carregar a carta do dia</h2>
            <p>{query.error?.message || 'Não foi possível carregar sua carta de hoje.'}</p>
            <button type="button" className={styles.primaryButton} onClick={() => query.refetch()}>
              Tentar novamente
            </button>
          </div>
        )}

        {!query.isLoading && !query.isError && data && (
          <div className={styles.resultCard}>
            <div className={styles.statusRow}>
              <span className={styles.badge}>{formatOracleDate(data.oracle_date)}</span>
            </div>

            {message?.nome_do_dia && (
              <h2 className={styles.dayName}>{message.nome_do_dia}</h2>
            )}

            <div className={styles.monthSpotlight}>
              {cardImage && (
                <div className={styles.dailyCardFrame}>
                  <FlippableCard
                    isFlipped={isFlipped}
                    frontImage={cardImage}
                    backImage={CARD_BACK_IMAGE}
                    cardName={data.card_name}
                  />
                </div>
              )}

              <div className={styles.monthSpotlightContent}>
                <p className={styles.monthCardName}>{data.card_name}</p>
                {keywords.length > 0 && (
                  <div className={styles.chipsRow}>
                    {keywords.map((word) => (
                      <span key={word} className={styles.themeChip}>{word}</span>
                    ))}
                  </div>
                )}
                {message?.mensagem ? (
                  <p>{message.mensagem}</p>
                ) : (
                  <p>Sua mensagem do dia está sendo preparada — volte em instantes.</p>
                )}
                {message?.intencao_pratica && (
                  <p className={styles.practicalHint}>
                    <strong>Pra hoje:</strong> {message.intencao_pratica}
                  </p>
                )}
              </div>
            </div>

            {cardInfo && (
              <div className={styles.sectionBlock}>
                <h3>Sobre {cardInfo.nome}</h3>
                <p>{cardInfo.descricao}</p>
                <Link to={`/biblioteca/${cardInfo.slug}`} className={styles.aboutLink}>
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
