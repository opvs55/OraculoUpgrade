import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DecorativeDivider from '../../components/common/DecorativeDivider/DecorativeDivider';
import Loader from '../../components/common/Loader/Loader';
import { useAuth } from '../../hooks/useAuth';
import { oraclesApi } from '../../services/api/oraclesApi';
import { resolveTarotCardImage } from '../../utils/resolveTarotCardImage';
import { baralho } from '../../tarotDeck';
import styles from './FeaturePage.module.css';

export default function CartaDoDiaPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ['oracles', 'daily-oracle', userId],
    queryFn: () => oraclesApi.getDailyOracle(),
    enabled: !!userId,
  });

  const data = query.data;
  const cardImage = data ? resolveTarotCardImage(data.card_name) : null;
  const cardInfo = data ? baralho.find((card) => card.nome === data.card_name) : null;
  const keywords = cardInfo?.palavras_chave?.direito?.slice(0, 4) || [];

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
              <span className={styles.badge}>{data.oracle_date}</span>
            </div>

            {cardImage && <img src={cardImage} alt={data.card_name} className={styles.cardImage} />}

            <div className={styles.messageCard}>
              <h2>{data.card_name}</h2>
              {keywords.length > 0 && (
                <div className={styles.chipsRow}>
                  {keywords.map((word) => (
                    <span key={word} className={styles.themeChip}>{word}</span>
                  ))}
                </div>
              )}
              {data.interpretation ? (
                <p>{data.interpretation}</p>
              ) : (
                <p>Sua mensagem do dia está sendo preparada — volte em instantes.</p>
              )}
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
