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

const trackDescriptions = {
  amor: 'Relações, vínculo, reconciliação e dinâmica afetiva.',
  carreira: 'Propósito, trabalho, decisões e próximos passos profissionais.',
  espiritualidade: 'Integração interior, símbolos e expansão de consciência.',
  dinheiro: 'Materialização, prosperidade e gestão de energia financeira.',
  saude: 'Equilíbrio físico, emocional e hábitos de sustentação.',
  geral: 'Leituras amplas da semana para visão macro e direcionamento.',
};

const normalizeObjective = (value) => {
  const normalized = (value || 'geral').toString().trim().toLowerCase();
  const exists = objectiveTracks.some((track) => track.value === normalized);
  return exists ? normalized : 'geral';
};

const formatForumDate = (isoDate) => {
  if (!isoDate) return 'Sem data';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return 'Sem data';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
};

const getTopicTitle = (thread) =>
  thread.shared_title || getQuestionText(thread.question, thread.spread_type);

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

  const visibleThreads = useMemo(() => {
    if (!objective) return threads;
    return threads.filter((thread) => normalizeObjective(thread.objective) === objective);
  }, [threads, objective]);

  const boardRows = useMemo(() => {
    const tracksToRender = objective
      ? objectiveTracks.filter((track) => track.value === objective)
      : objectiveTracks.filter((track) => track.value);

    return tracksToRender.map((track) => {
      const rowThreads = visibleThreads.filter(
        (thread) => normalizeObjective(thread.objective) === track.value,
      );
      const latestThread = [...rowThreads].sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
      )[0];
      return {
        ...track,
        description: trackDescriptions[track.value],
        topicCount: rowThreads.length,
        messageCount: rowThreads.reduce(
          (sum, item) => sum + Number(item.comments?.[0]?.count || 0),
          0,
        ),
        latestThread,
      };
    });
  }, [visibleThreads, objective]);

  const recentTopics = useMemo(
    () =>
      [...visibleThreads]
        .sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
        )
        .slice(0, 8),
    [visibleThreads],
  );

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Comunidade • Fórum</p>
        <h1>Fórum de Leituras</h1>
        <p>
          Estrutura em estilo portal: categorias por objetivo, métricas de atividade e últimos
          tópicos em destaque para facilitar navegação.
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

      {!isLoading && visibleThreads.length === 0 && (
        <p className={styles.empty}>Ainda não há tópicos neste trilho. Seja o primeiro a abrir uma leitura pública.</p>
      )}

      <section className={styles.boardLayout}>
        <article className={styles.forumPanel}>
          <div className={styles.tableHeader}>
            <span>Fóruns por objetivo</span>
            <span>Tópicos</span>
            <span>Mensagens</span>
            <span>Último post</span>
          </div>

          {boardRows.map((row) => (
            <div key={row.value} className={styles.tableRow}>
              <div className={styles.forumCell}>
                <span className={styles.objectiveBadge}>{row.label}</span>
                <h2>{row.label} Fórum</h2>
                <p>{row.description}</p>
              </div>

              <div className={styles.statCell}>
                <strong>{row.topicCount}</strong>
                <span>Tópicos</span>
              </div>

              <div className={styles.statCell}>
                <strong>{row.messageCount}</strong>
                <span>Mensagens</span>
              </div>

              <div className={styles.latestCell}>
                {row.latestThread ? (
                  <>
                    <Link to={`/leitura/${row.latestThread.id}`}>
                      {getTopicTitle(row.latestThread)}
                    </Link>
                    <p>
                      @{row.latestThread.profiles?.username || 'anônimo'} •{' '}
                      {formatForumDate(row.latestThread.created_at)}
                    </p>
                  </>
                ) : (
                  <p className={styles.noPost}>Sem publicações recentes</p>
                )}
              </div>
            </div>
          ))}
        </article>

        <aside className={styles.sidebar}>
          <article className={styles.sidePanel}>
            <h3>Últimos tópicos</h3>
            <ul className={styles.recentList}>
              {recentTopics.length === 0 && <li className={styles.noPost}>Sem tópicos recentes.</li>}
              {recentTopics.map((thread) => (
                <li key={thread.id}>
                  <Link to={`/leitura/${thread.id}`}>{getTopicTitle(thread)}</Link>
                  <p>
                    <span>{normalizeObjective(thread.objective)}</span> •{' '}
                    {formatForumDate(thread.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          </article>

          <article className={styles.sidePanel}>
            <h3>Explorar comunidade</h3>
            <div className={styles.sideActions}>
              <Link to="/comunidade/debates">Debates abertos</Link>
              <Link to="/comunidade/aprendizado">Zona de aprendizado</Link>
              <Link to="/comunidade/leaderboard">Leaderboard</Link>
            </div>
          </article>
        </aside>
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
