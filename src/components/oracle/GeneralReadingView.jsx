import React from 'react';
import styles from './GeneralReadingView.module.css';

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\n|•|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

function Section({ title, delay = '0ms', children, className = '' }) {
  if (!children) return null;
  return (
    <section className={`${styles.section} ${styles.appear} ${className}`.trim()} style={{ '--d': delay }}>
      {title && <h3>{title}</h3>}
      {children}
    </section>
  );
}

function ListBlock({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className={styles.listBlock}>
      <h4>{title}</h4>
      <ul>
        {items.map((item) => (
          <li key={`${title}-${item}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function GeneralReadingView({ finalReading }) {
  if (!finalReading) return null;

  const signals = finalReading?.signals || {};
  const synthesisRaw = finalReading?.synthesis || {};
  const practicalRaw = finalReading?.practical_guidance || {};

  const synthesis = {
    convergences: toArray(synthesisRaw?.convergences),
    tensions: toArray(synthesisRaw?.tensions),
    theme_of_week: synthesisRaw?.theme_of_week || synthesisRaw?.theme || '',
    hidden_lesson: synthesisRaw?.hidden_lesson || synthesisRaw?.lesson || '',
  };

  const practicalGuidance = {
    do: toArray(practicalRaw?.do),
    avoid: toArray(practicalRaw?.avoid),
    ritual: practicalRaw?.ritual || practicalRaw?.practice || '',
    reflection_question: practicalRaw?.reflection_question || practicalRaw?.question || '',
  };

  const signalCards = [
    { key: 'tarot', title: 'Tarot', value: signals?.tarot },
    { key: 'runes', title: 'Runas', value: signals?.runes },
    { key: 'i_ching', title: 'I Ching', value: signals?.i_ching },
    { key: 'numerology', title: 'Numerologia', value: signals?.numerology },
  ].filter((item) => item.value);

  return (
    <div className={styles.wrapper}>
      <Section delay="40ms" className={styles.headerBlock}>
        <h2>{finalReading?.title || 'Leitura Geral Semanal'}</h2>
        {finalReading?.one_liner && <blockquote>“{finalReading.one_liner}”</blockquote>}
      </Section>

      <Section title="Visão Geral" delay="90ms">
        {Array.isArray(finalReading?.overview) ? (
          finalReading.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
        ) : (
          <p>{finalReading?.overview}</p>
        )}
      </Section>

      {signalCards.length > 0 && (
        <Section title="Sinais da Semana" delay="130ms">
          <div className={styles.signalsGrid}>
            {signalCards.map((signal, index) => (
              <article
                key={signal.key}
                className={`${styles.signalCard} ${styles.appear}`}
                style={{ '--d': `${180 + index * 70}ms` }}
              >
                <h4>{signal.title}</h4>
                <p>{signal.value}</p>
              </article>
            ))}
          </div>
        </Section>
      )}

      <Section title="Síntese" delay="200ms">
        <div className={styles.doubleColumn}>
          <ListBlock title="Convergências" items={synthesis?.convergences} />
          <ListBlock title="Tensões" items={synthesis?.tensions} />
        </div>
        {!synthesis?.convergences?.length && !synthesis?.tensions?.length && (
          <p className={styles.fallbackText}>
            Síntese em processamento. Use os sinais da semana para orientar suas escolhas com calma e consistência.
          </p>
        )}
        {synthesis?.theme_of_week && <p><strong>Tema da semana:</strong> {synthesis.theme_of_week}</p>}
        {synthesis?.hidden_lesson && <p><strong>Lição oculta:</strong> {synthesis.hidden_lesson}</p>}
      </Section>

      <Section title="Guia Prático" delay="240ms">
        <div className={styles.doubleColumn}>
          <ListBlock title="Faça" items={practicalGuidance?.do} />
          <ListBlock title="Evite" items={practicalGuidance?.avoid} />
        </div>
        {!practicalGuidance?.do?.length && !practicalGuidance?.avoid?.length && (
          <p className={styles.fallbackText}>
            Guia prático em construção. Foque em ações pequenas, revisão diária e uma decisão consciente por vez.
          </p>
        )}
        {practicalGuidance?.ritual && <p><strong>Ritual:</strong> {practicalGuidance.ritual}</p>}
        {practicalGuidance?.reflection_question && (
          <p><strong>Pergunta de reflexão:</strong> {practicalGuidance.reflection_question}</p>
        )}
      </Section>

      <Section title="Encerramento" delay="290ms">
        <p>{finalReading?.closing}</p>
      </Section>

      <Section delay="320ms" className={styles.footerBlock}>
        <div className={styles.tags}>
          {Array.isArray(finalReading?.tags) &&
            finalReading.tags.map((tag) => (
              <span key={tag} className={styles.chip}>{tag}</span>
            ))}
        </div>
        {finalReading?.energy_score !== undefined && finalReading?.energy_score !== null && (
          <span className={styles.energyBadge}>Energia: {finalReading.energy_score}</span>
        )}
      </Section>
    </div>
  );
}
