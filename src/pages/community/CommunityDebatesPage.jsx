import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader/Loader';
import { usePublicReadings } from '../../hooks/useReadings';
import styles from './CommunityDebatesPage.module.css';

export default function CommunityDebatesPage() {
  const [sort, setSort] = useState('hot');
  const {
    pages,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePublicReadings({
    sort,
    feedMode: 'general',
    onlyWithPrompt: true,
  });

  const debates = useMemo(
    () =>
      pages
        .flatMap((page) => page.data)
        .filter((reading) => reading?.interpretation_data?.community_prompt?.question),
    [pages],
  );

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Comunidade • Debates</p>
        <h1>Debates de Cartas e Leituras</h1>
        <p>
          Espaço para responder pedidos de interpretação, confrontar leituras e construir
          visão coletiva de cada tiragem.
        </p>
      </header>

      <section className={styles.sortBar}>
        <span>Ordenar debates:</span>
        <button type="button" className={sort === 'hot' ? styles.active : ''} onClick={() => setSort('hot')}>
          Quente
        </button>
        <button type="button" className={sort === 'popular' ? styles.active : ''} onClick={() => setSort('popular')}>
          Popular
        </button>
        <button type="button" className={sort === 'recent' ? styles.active : ''} onClick={() => setSort('recent')}>
          Recente
        </button>
      </section>

      {isLoading && <Loader customText="Abrindo debates da comunidade..." />}
      {isError && <p className={styles.error}>Erro: {error?.message}</p>}
      {!isLoading && debates.length === 0 && (
        <p className={styles.empty}>Ainda não há debates abertos. Abra um pedido ao compartilhar sua leitura.</p>
      )}

      <section className={styles.grid}>
        {debates.map((reading) => {
          const prompt = reading.interpretation_data?.community_prompt;
          return (
            <article key={reading.id} className={styles.card}>
              <header>
                <span className={styles.position}>{prompt?.position || 'geral'}</span>
                <span className={styles.meta}>💬 {reading.comments?.[0]?.count || 0}</span>
              </header>
              <h2>“{prompt?.question}”</h2>
              <p className={styles.author}>Debate iniciado por @{reading.profiles?.username || 'anônimo'}</p>
              <p className={styles.summary}>{reading.shared_title || 'Leitura pública em debate.'}</p>
              <div className={styles.actions}>
                <Link to={`/leitura/${reading.id}`}>Entrar no debate</Link>
              </div>
            </article>
          );
        })}
      </section>

      {hasNextPage && (
        <div className={styles.loadMoreWrap}>
          <button type="button" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais debates'}
          </button>
        </div>
      )}
    </div>
  );
}
