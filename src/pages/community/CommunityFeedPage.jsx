import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { usePublicReadings } from '../../hooks/useReadings';
import ReadingCard from '../../components/ReadingCard/ReadingCard';
import Loader from '../../components/common/Loader/Loader';
import { getQuestionText } from '../../utils/getQuestionText';
import { getCurrentIntegratedTags, getCurrentRitualTags } from '../../utils/communityRitual';
import styles from './CommunityFeedPage.module.css';

const spreadOptions = [
  { value: '', label: 'Todos os formatos' },
  { value: 'celticCross', label: 'Cruz Celta' },
  { value: 'threeCards', label: 'Três Cartas' },
  { value: 'oneCard', label: 'Uma Carta' },
  { value: 'templeOfAphrodite', label: 'Templo de Afrodite' },
  { value: 'pathChoice', label: 'Escolha de Caminho' },
];

function CommunityFeedPage() {
  const [sortBy, setSortBy] = useState({ column: 'created_at', ascending: false });
  const [feedMode, setFeedMode] = useState('ritual');
  const [searchTerm, setSearchTerm] = useState('');
  const [spreadType, setSpreadType] = useState('');
  const [onlyWithPrompt, setOnlyWithPrompt] = useState(false);
  const { weekRef, ritualTag, tags: ritualTags } = getCurrentRitualTags();
  const { integratedTag } = getCurrentIntegratedTags();

  const {
    pages,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = usePublicReadings({ sortBy, ritualTags });

  const allReadings = pages.flatMap((page) => page.data);

  const feedStats = useMemo(() => {
    const ritualCount = allReadings.filter((reading) => Array.isArray(reading.tags) && reading.tags.includes(ritualTag)).length;
    const integratedCount = allReadings.filter((reading) =>
      Array.isArray(reading.tags) && (reading.tags.includes('integrada') || reading.tags.includes(integratedTag))
    ).length;
    const promptCount = allReadings.filter((reading) => Boolean(reading?.interpretation_data?.community_prompt?.question)).length;

    return {
      total: allReadings.length,
      ritualCount,
      integratedCount,
      promptCount,
    };
  }, [allReadings, integratedTag, ritualTag]);

  const readings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const byMode = allReadings.filter((reading) => {
      if (!Array.isArray(reading.tags)) return feedMode === 'general';
      if (feedMode === 'ritual') return reading.tags.includes(ritualTag);
      if (feedMode === 'integrated') return reading.tags.includes('integrada') || reading.tags.includes(integratedTag);
      return true;
    });

    const byFilters = byMode.filter((reading) => {
      if (spreadType && reading.spread_type !== spreadType) return false;
      if (onlyWithPrompt && !reading?.interpretation_data?.community_prompt?.question) return false;
      if (!normalizedSearch) return true;

      const searchable = [
        reading.shared_title || '',
        getQuestionText(reading.question, reading.spread_type) || '',
        reading.profiles?.username || '',
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });

    return [...byFilters].sort((a, b) => {
      const aIsRitual = Array.isArray(a.tags) && a.tags.includes(ritualTag);
      const bIsRitual = Array.isArray(b.tags) && b.tags.includes(ritualTag);
      if (aIsRitual === bIsRitual) return 0;
      return aIsRitual ? -1 : 1;
    });
  }, [allReadings, feedMode, integratedTag, onlyWithPrompt, ritualTag, searchTerm, spreadType]);

  const breakpointColumnsObj = {
    default: 4,
    1400: 3,
    992: 2,
    768: 1
  };

  return (
    <div className={`content_wrapper ${styles.pageWrapper}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Leituras da Comunidade</h1>
        <p className={styles.subtitle}>Explore as jornadas e insights compartilhados por outros consulentes.</p>

        <section className={styles.ritualCard}>
          <p className={styles.ritualEyebrow}>Ritual da Semana</p>
          <h2 className={styles.ritualTitle}>Círculo Grimório • {weekRef}</h2>
          <p className={styles.ritualText}>
            Nesta semana, o foco da comunidade está em compartilhar leituras com a vibração do ritual coletivo.
          </p>
          <p className={styles.ritualTagHint}>
            Tag ritual: <strong>{ritualTag}</strong> · Tag integrada: <strong>{integratedTag}</strong>
          </p>
          <p className={styles.ritualGuide}>
            Quer melhorar a qualidade da comunidade? Gere primeiro a{' '}
            <Link to="/oraculo/geral" className={styles.inlineLink}>
              Leitura Geral Integrada
            </Link>{' '}
            e depois compartilhe sua leitura com contexto.
          </p>
          <div className={styles.kpiRow}>
            <div className={styles.kpiCard}>
              <span>Total</span>
              <strong>{feedStats.total}</strong>
            </div>
            <div className={styles.kpiCard}>
              <span>Ritual</span>
              <strong>{feedStats.ritualCount}</strong>
            </div>
            <div className={styles.kpiCard}>
              <span>Integradas</span>
              <strong>{feedStats.integratedCount}</strong>
            </div>
            <div className={styles.kpiCard}>
              <span>Com pedido</span>
              <strong>{feedStats.promptCount}</strong>
            </div>
          </div>
          <div className={styles.feedToggle}>
            <button
              onClick={() => setFeedMode('ritual')}
              className={feedMode === 'ritual' ? styles.active : ''}
              type="button"
            >
              Ritual
            </button>
            <button
              onClick={() => setFeedMode('integrated')}
              className={feedMode === 'integrated' ? styles.active : ''}
              type="button"
            >
              Integradas
            </button>
            <button
              onClick={() => setFeedMode('general')}
              className={feedMode === 'general' ? styles.active : ''}
              type="button"
            >
              Feed Geral
            </button>
          </div>
        </section>

        <div className={styles.controls}>
          <span>Ordenar por:</span>
          <button
            onClick={() => setSortBy({ column: 'created_at', ascending: false })}
            className={sortBy.column === 'created_at' ? styles.active : ''}
          >
            Mais Recentes
          </button>
          <button
            onClick={() => setSortBy({ column: 'stars', ascending: false })}
            className={sortBy.column === 'stars' ? styles.active : ''}
          >
            Mais Populares
          </button>
        </div>
        <div className={styles.discoveryControls}>
          <input
            type="search"
            placeholder="Buscar por título, pergunta ou @usuário..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className={styles.searchInput}
          />
          <select
            value={spreadType}
            onChange={(event) => setSpreadType(event.target.value)}
            className={styles.spreadSelect}
          >
            {spreadOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className={styles.promptFilter}>
            <input
              type="checkbox"
              checked={onlyWithPrompt}
              onChange={(event) => setOnlyWithPrompt(event.target.checked)}
            />
            Apenas pedidos de interpretação
          </label>
        </div>
      </header>

      {isLoading && <Loader customText="Buscando no Oráculo Coletivo..." />}
      {isError && <p className={styles.error}>Ocorreu um erro: {error.message}</p>}

      {!isLoading && readings.length === 0 && (
        <p className={styles.empty}>
          {feedMode === 'ritual' && 'Nenhuma leitura no ritual ainda. Seja o primeiro a publicar com a tag da semana.'}
          {feedMode === 'integrated' && 'Ainda não há leituras integradas. Marque uma leitura como integrada ao compartilhar.'}
          {feedMode === 'general' && 'Nenhuma leitura encontrada com os filtros atuais. Ajuste sua busca ou compartilhe a sua.'}
        </p>
      )}

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className={styles.masonryGrid}
        columnClassName={styles.masonryGrid_column}
      >
        {readings.map(reading => (
          <ReadingCard key={reading.id} reading={reading} />
        ))}
      </Masonry>

      {hasNextPage && (
        <div className={styles.loadMoreContainer}>
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className={styles.loadMoreButton}
          >
            {isFetchingNextPage ? 'Carregando...' : 'Explorar Mais Jornadas'}
          </button>
        </div>
      )}
    </div>
  );
}

export default CommunityFeedPage;
