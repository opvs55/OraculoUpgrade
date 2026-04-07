import React from 'react';
import { Link } from 'react-router-dom';
import { useCommunityTrendingTopics } from '../../hooks/useReadings';
import { getCurrentRitualTags } from '../../utils/communityRitual';
import styles from './CommunityLearningPage.module.css';

const tracks = [
  {
    title: 'Trilha Amor',
    description: 'Como ler padrões emocionais, vínculos e equilíbrio afetivo nas tiragens.',
    cta: 'Estudar cartas afetivas',
    to: '/biblioteca',
  },
  {
    title: 'Trilha Carreira',
    description: 'Interpretações orientadas para propósito, movimento profissional e decisões.',
    cta: 'Estudar cartas de caminho',
    to: '/biblioteca',
  },
  {
    title: 'Trilha Espiritualidade',
    description: 'Arquétipos profundos, integração simbólica e leitura de expansão interna.',
    cta: 'Estudar arcana espiritual',
    to: '/biblioteca',
  },
];

export default function CommunityLearningPage() {
  const { weekRef } = getCurrentRitualTags();
  const { data: trendingTopics = [] } = useCommunityTrendingTopics(weekRef);

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Comunidade • Aprendizado</p>
        <h1>Zona de Aprendizado de Tarot</h1>
        <p>
          Espaço dedicado à evolução técnica de leitura: trilhas práticas, estudo orientado
          por tema e integração com debates da comunidade.
        </p>
      </header>

      <section className={styles.trackGrid}>
        {tracks.map((track) => (
          <article key={track.title} className={styles.trackCard}>
            <h2>{track.title}</h2>
            <p>{track.description}</p>
            <Link to={track.to}>{track.cta}</Link>
          </article>
        ))}
      </section>

      <section className={styles.learningBoard}>
        <article className={styles.learningPanel}>
          <h3>Rotina semanal recomendada</h3>
          <ol>
            <li>Gerar leitura pessoal (Tarot, Runas ou I Ching).</li>
            <li>Comparar com 2 leituras públicas no Fórum.</li>
            <li>Entrar em 1 debate aberto e responder com interpretação.</li>
            <li>Registrar no grimório seu insight final da semana.</li>
          </ol>
        </article>

        <article className={styles.learningPanel}>
          <h3>Tópicos para estudar agora</h3>
          <div className={styles.chips}>
            {trendingTopics.length === 0 && <span className={styles.empty}>Sem tópicos em alta neste ciclo.</span>}
            {trendingTopics.slice(0, 10).map((topic) => (
              <span key={`${topic.topic_type}-${topic.topic}`} className={styles.chip}>
                {topic.topic_type === 'objective' ? `#${topic.topic}` : topic.topic}
              </span>
            ))}
          </div>
          <div className={styles.panelActions}>
            <Link to="/comunidade/forum">Abrir fórum</Link>
            <Link to="/comunidade/debates">Ver debates</Link>
          </div>
        </article>
      </section>
    </div>
  );
}
