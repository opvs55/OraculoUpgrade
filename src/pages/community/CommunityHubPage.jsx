import React from 'react';
import { Link } from 'react-router-dom';
import {
  useCommunityTopAuthors,
  useCommunityTrendingTopics,
  useCommunityWeeklyAggregates,
} from '../../hooks/useReadings';
import { getCurrentRitualTags } from '../../utils/communityRitual';
import styles from './CommunityHubPage.module.css';

const spaces = [
  {
    title: 'Mural de Leituras',
    description: 'Explore leituras em formato visual, com filtros por objetivo e ranking social.',
    to: '/comunidade/feed',
    cta: 'Entrar no Mural',
  },
  {
    title: 'Fórum por Objetivo',
    description: 'Discussões estruturadas por amor, carreira, espiritualidade e outros trilhos.',
    to: '/comunidade/forum',
    cta: 'Abrir Fórum',
  },
  {
    title: 'Debates Abertos',
    description: 'Responda pedidos de interpretação e participe de debates em tempo real por leitura.',
    to: '/comunidade/debates',
    cta: 'Ver Debates',
  },
  {
    title: 'Aprendizado Tarot',
    description: 'Percursos guiados, prática por carta e referências da semana para estudo contínuo.',
    to: '/comunidade/aprendizado',
    cta: 'Ir para Aprendizado',
  },
  {
    title: 'Leaderboard',
    description: 'Ranking semanal/mensal com progressão de reputação e trilhas por objetivo.',
    to: '/comunidade/leaderboard',
    cta: 'Ver Ranking',
  },
];

export default function CommunityHubPage() {
  const { weekRef } = getCurrentRitualTags();
  const { data: aggregates } = useCommunityWeeklyAggregates(weekRef);
  const { data: trending = [] } = useCommunityTrendingTopics(weekRef);
  const { data: topAuthors = [] } = useCommunityTopAuthors(weekRef, 3);

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Comunidade</p>
        <h1>Ecossistema Social do Grimório</h1>
        <p>
          Agora sua comunidade está separada em espaços especializados: mural visual, fórum temático,
          debates de leituras e trilhas de aprendizado.
        </p>
      </header>

      <section className={styles.kpiGrid}>
        <article className={styles.kpiCard}>
          <span>Total semanal</span>
          <strong>{Number(aggregates?.total || 0)}</strong>
        </article>
        <article className={styles.kpiCard}>
          <span>Posts no ritual</span>
          <strong>{Number(aggregates?.total_ritual || 0)}</strong>
        </article>
        <article className={styles.kpiCard}>
          <span>Leituras integradas</span>
          <strong>{Number(aggregates?.total_integrated || 0)}</strong>
        </article>
        <article className={styles.kpiCard}>
          <span>Debates abertos</span>
          <strong>{Number(aggregates?.total_prompt_open || 0)}</strong>
        </article>
      </section>

      <section className={styles.spaceGrid}>
        {spaces.map((space) => (
          <article key={space.to} className={styles.spaceCard}>
            <h2>{space.title}</h2>
            <p>{space.description}</p>
            <Link to={space.to}>{space.cta}</Link>
          </article>
        ))}
      </section>

      <section className={styles.bottomGrid}>
        <article className={styles.panel}>
          <h3>Assuntos quentes</h3>
          <div className={styles.chips}>
            {trending.length === 0 && <span className={styles.empty}>Sem dados desta semana ainda.</span>}
            {trending.slice(0, 8).map((topic) => (
              <span key={`${topic.topic_type}-${topic.topic}`} className={styles.chip}>
                {topic.topic_type === 'objective' ? `#${topic.topic}` : topic.topic}
              </span>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <h3>Oráculos em destaque</h3>
          {topAuthors.length === 0 && <p className={styles.empty}>Ainda não há destaque neste ciclo.</p>}
          <ul className={styles.topList}>
            {topAuthors.map((author, index) => (
              <li key={author.profile_id || `${author.username}-${index}`}>
                <span>#{index + 1}</span>
                <div>
                  {author.username ? (
                    <Link to={`/perfil/${author.username}`}>@{author.username}</Link>
                  ) : (
                    <p>Perfil sem username</p>
                  )}
                  <p>Score {author.author_score || 0} • ⭐ {author.received_stars || 0}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
