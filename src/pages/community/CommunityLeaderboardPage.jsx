import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/common/Loader/Loader';
import { getQuestionText } from '../../utils/getQuestionText';
import {
  useCommunityLeaderboardAuthors,
  useCommunityLeaderboardReadings,
} from '../../hooks/useReadings';
import styles from './CommunityLeaderboardPage.module.css';

const objectiveOptions = [
  { value: '', label: 'Todos os objetivos' },
  { value: 'amor', label: 'Amor' },
  { value: 'carreira', label: 'Carreira' },
  { value: 'espiritualidade', label: 'Espiritualidade' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'saude', label: 'Saúde' },
  { value: 'geral', label: 'Geral' },
];

const levelOrder = ['Iniciado', 'Adepto', 'Guardião', 'Arconte', 'Lenda'];

const levelColorClass = {
  Iniciado: 'levelInitiated',
  Adepto: 'levelAdept',
  Guardião: 'levelGuardian',
  Arconte: 'levelArchon',
  Lenda: 'levelLegend',
};

function ReputationProgress({ currentLevel, progressPercent, nextLevel }) {
  const currentIndex = Math.max(0, levelOrder.indexOf(currentLevel));
  const nextIndex = Math.max(currentIndex, levelOrder.indexOf(nextLevel));
  const displayPercent = Math.max(0, Math.min(100, Number(progressPercent || 0)));

  return (
    <div className={styles.progressWrap}>
      <div className={styles.progressHeader}>
        <span className={`${styles.levelPill} ${styles[levelColorClass[currentLevel] || 'levelInitiated']}`}>
          {currentLevel || 'Iniciado'}
        </span>
        <span className={styles.progressText}>
          {displayPercent}% para {nextLevel || 'Lenda'}
        </span>
      </div>
      <div className={styles.progressBarTrack}>
        <div className={styles.progressBarFill} style={{ width: `${displayPercent}%` }} />
      </div>
      <div className={styles.levelRail}>
        {levelOrder.map((level, index) => (
          <span
            key={level}
            className={`${styles.levelRailItem} ${index <= nextIndex ? styles.levelRailActive : ''} ${
              index === currentIndex ? styles.levelRailCurrent : ''
            }`}
          >
            {level}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CommunityLeaderboardPage() {
  const [period, setPeriod] = useState('weekly');
  const [objective, setObjective] = useState('');

  const {
    data: topAuthors = [],
    isLoading: isLoadingAuthors,
    isError: isAuthorsError,
    error: authorsError,
  } = useCommunityLeaderboardAuthors({ period, objective, limit: 20 });

  const {
    data: topReadings = [],
    isLoading: isLoadingReadings,
    isError: isReadingsError,
    error: readingsError,
  } = useCommunityLeaderboardReadings({ period, objective, limit: 20 });

  const topThreeAuthors = useMemo(() => topAuthors.slice(0, 3), [topAuthors]);
  const otherAuthors = useMemo(() => topAuthors.slice(3), [topAuthors]);

  const isLoading = isLoadingAuthors || isLoadingReadings;
  const isError = isAuthorsError || isReadingsError;
  const errorMessage = authorsError?.message || readingsError?.message || 'Falha ao carregar leaderboard';

  return (
    <div className={`content_wrapper ${styles.pageWrapper}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Leaderboard da Comunidade</h1>
        <p className={styles.subtitle}>
          Ranking social de oráculos por impacto comunitário, trilha por objetivo e progressão de reputação.
        </p>
      </header>

      <section className={styles.controls}>
        <div className={styles.periodToggle}>
          <button
            type="button"
            onClick={() => setPeriod('weekly')}
            className={period === 'weekly' ? styles.active : ''}
          >
            Semanal
          </button>
          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={period === 'monthly' ? styles.active : ''}
          >
            Mensal
          </button>
        </div>

        <select
          value={objective}
          onChange={(event) => setObjective(event.target.value)}
          className={styles.objectiveSelect}
        >
          {objectiveOptions.map((option) => (
            <option key={option.value || 'all-objectives'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <Link to="/comunidade" className={styles.backLink}>
          Voltar ao Feed
        </Link>
      </section>

      {isLoading && <Loader customText="Canalizando ranking social..." />}
      {isError && <p className={styles.error}>Erro: {errorMessage}</p>}

      {!isLoading && !isError && (
        <>
          <section className={styles.podiumSection}>
            <h2>Top Oráculos ({period === 'weekly' ? 'Semana' : 'Mês'})</h2>
            <div className={styles.podiumGrid}>
              {topThreeAuthors.map((author) => (
                <article key={author.profile_id || author.username || author.rank} className={styles.podiumCard}>
                  <div className={styles.rankBadge}>#{author.rank}</div>
                  <div className={styles.podiumHeader}>
                    <img
                      src={author.avatar_url || 'https://i.imgur.com/6VBx3io.png'}
                      alt={author.username || 'Autor'}
                      className={styles.avatar}
                    />
                    <div>
                      {author.username ? (
                        <Link to={`/perfil/${author.username}`} className={styles.authorName}>
                          @{author.username}
                        </Link>
                      ) : (
                        <span className={styles.authorName}>@sem-username</span>
                      )}
                      <p className={styles.scoreText}>Score: {author.author_score || 0}</p>
                    </div>
                  </div>
                  <ReputationProgress
                    currentLevel={author.reputation_level}
                    progressPercent={author.progress_percent}
                    nextLevel={author.next_level}
                  />
                  <div className={styles.metricRow}>
                    <span>Leituras: {author.public_readings || 0}</span>
                    <span>⭐ {author.received_stars || 0}</span>
                    <span>💬 {author.received_comments || 0}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.columns}>
            <article className={styles.columnCard}>
              <h3>Ranking Completo de Oráculos</h3>
              {topAuthors.length === 0 && <p className={styles.empty}>Ainda não há dados para este período.</p>}
              <ul className={styles.list}>
                {otherAuthors.map((author) => (
                  <li key={author.profile_id || `${author.username}-${author.rank}`} className={styles.listItem}>
                    <span className={styles.rankMini}>#{author.rank}</span>
                    <div className={styles.listMain}>
                      {author.username ? (
                        <Link to={`/perfil/${author.username}`} className={styles.authorNameInline}>
                          @{author.username}
                        </Link>
                      ) : (
                        <span className={styles.authorNameInline}>@sem-username</span>
                      )}
                      <span className={styles.metaInline}>
                        Score {author.author_score || 0} · Leituras {author.public_readings || 0} · ⭐ {author.received_stars || 0}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className={styles.columnCard}>
              <h3>Top Leituras</h3>
              {topReadings.length === 0 && <p className={styles.empty}>Ainda não há leituras para rankear.</p>}
              <ul className={styles.list}>
                {topReadings.map((reading) => (
                  <li key={reading.reading_id} className={styles.listItem}>
                    <span className={styles.rankMini}>#{reading.rank}</span>
                    <div className={styles.listMain}>
                      <Link to={`/leitura/${reading.reading_id}`} className={styles.readingTitle}>
                        {reading.shared_title || getQuestionText(reading.question, reading.spread_type)}
                      </Link>
                      <span className={styles.metaInline}>
                        @{reading.username || 'anonimo'} · ⭐ {reading.star_count || 0} · 💬 {reading.comment_count || 0}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
