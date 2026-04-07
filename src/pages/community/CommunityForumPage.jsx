import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader/Loader';
import { usePublicReadings } from '../../hooks/useReadings';
import { getQuestionText } from '../../utils/getQuestionText';
import styles from './CommunityForumPage.module.css';

const objectiveTracks = [
  { value: '', label: 'Todos' },
  { value: 'amor', label: 'Amor' },
  { value: 'carreira', label: 'Carreira' },
  { value: 'espiritualidade', label: 'Espiritualidade' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'saude', label: 'Saúde' },
  { value: 'geral', label: 'Geral' },
];

export default function CommunityForumPage() {
  const [objective, setObjective] = useState('');
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
    objective,
    feedMode: 'general',
    spreadType: '',
    onlyWithPrompt: false,
  });

  const threads = useMemo(
    () => pages.flatMap((page) => page.data).filter((reading) => reading?.id),
    [pages],
  );

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Comunidade • Fórum</p>
        <h1>Fórum de Leituras por Objetivo</h1>
        <p>
          Modelo de board para discussão estruturada. Cada leitura funciona como um tópico com
          respostas e interpretações da comunidade.
        </p>
      </header>

      <section className={styles.controls}>
        <div className={styles.trackRow}>
          {objectiveTracks.map((track) => (
            <button
              key={track.value || 'all'}
              type="button"
              className={objective === track.value ? styles.active : ''}
              onClick={() => setObjective(track.value)}
            >
              {track.label}
            </button>
          ))}
        </div>
        <div className={styles.sortRow}>
          <span>Ordenar por:</span>
          <button type="button" className={sort === 'hot' ? styles.active : ''} onClick={() => setSort('hot')}>
            Quente
          </button>
          <button type="button" className={sort === 'popular' ? styles.active : ''} onClick={() => setSort('popular')}>
            Popular
          </button>
          <button type="button" className={sort === 'recent' ? styles.active : ''} onClick={() => setSort('recent')}>
            Recente
          </button>
        </div>
      </section>

      {isLoading && <Loader customText="Carregando tópicos do fórum..." />}
      {isError && <p className={styles.error}>Erro ao carregar fórum: {error?.message}</p>}

      {!isLoading && threads.length === 0 && (
        <p className={styles.empty}>Ainda não há tópicos neste trilho. Seja o primeiro a abrir uma leitura pública.</p>
      )}

      <section className={styles.threadGrid}>
        {threads.map((thread) => (
          <article key={thread.id} className={styles.threadCard}>
            <header className={styles.threadHeader}>
              <span className={styles.objectiveBadge}>{thread.objective || 'geral'}</span>
              <span className={styles.meta}>⭐ {thread.stars?.[0]?.count || 0} • 💬 {thread.comments?.[0]?.count || 0}</span>
            </header>
            <h2>{thread.shared_title || getQuestionText(thread.question, thread.spread_type)}</h2>
            <p className={styles.author}>por @{thread.profiles?.username || 'anônimo'}</p>
            {thread?.interpretation_data?.community_prompt?.question && (
              <p className={styles.prompt}>Pedido aberto: “{thread.interpretation_data.community_prompt.question}”</p>
            )}
            <div className={styles.actions}>
              <Link to={`/leitura/${thread.id}`}>Abrir discussão</Link>
            </div>
          </article>
        ))}
      </section>

      {hasNextPage && (
        <div className={styles.loadMoreWrap}>
          <button type="button" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais tópicos'}
          </button>
        </div>
      )}
    </div>
  );
}
