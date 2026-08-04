import React from 'react';
import styles from './GeneralReadingView.module.css';
import SignalConstellation from './SignalConstellation';
import EnergyDial from './EnergyDial';

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
  const synthesis = finalReading?.synthesis || {};
  const practicalGuidance = finalReading?.practical_guidance || {};
  const hasSignals = Object.values(signals).some(Boolean);

  return (
    <div className={styles.wrapper}>
      <Section delay="40ms" className={styles.headerBlock}>
        <h2>{finalReading?.title || 'Leitura Geral Semanal'}</h2>
        {finalReading?.one_liner && <blockquote>“{finalReading.one_liner}”</blockquote>}
        {finalReading?.energy_score !== undefined && finalReading?.energy_score !== null && (
          <div className={styles.dialWrap}>
            <EnergyDial score={finalReading.energy_score} />
          </div>
        )}
      </Section>

      <Section title="Visão Geral" delay="90ms">
        {Array.isArray(finalReading?.overview) ? (
          finalReading.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
        ) : (
          <p>{finalReading?.overview}</p>
        )}
      </Section>

      {hasSignals && (
        <Section title="Sinais da Semana" delay="130ms">
          <SignalConstellation signals={signals} />
        </Section>
      )}

      <Section title="Síntese" delay="200ms">
        <div className={styles.doubleColumn}>
          <ListBlock title="Convergências" items={synthesis?.convergences} />
          <ListBlock title="Tensões" items={synthesis?.tensions} />
        </div>
        {synthesis?.theme_of_week && <p><strong>Tema da semana:</strong> {synthesis.theme_of_week}</p>}
        {synthesis?.hidden_lesson && <p><strong>Lição oculta:</strong> {synthesis.hidden_lesson}</p>}
      </Section>

      <Section title="Guia Prático" delay="240ms">
        <div className={styles.doubleColumn}>
          <ListBlock title="Faça" items={practicalGuidance?.do} />
          <ListBlock title="Evite" items={practicalGuidance?.avoid} />
        </div>
        {practicalGuidance?.ritual && <p><strong>Ritual:</strong> {practicalGuidance.ritual}</p>}
        {practicalGuidance?.reflection_question && (
          <p><strong>Pergunta de reflexão:</strong> {practicalGuidance.reflection_question}</p>
        )}
      </Section>

      <Section title="Encerramento" delay="290ms">
        <p>{finalReading?.closing}</p>
      </Section>

      {Array.isArray(finalReading?.tags) && finalReading.tags.length > 0 && (
        <Section delay="320ms" className={styles.footerBlock}>
          <div className={styles.tags}>
            {finalReading.tags.map((tag) => (
              <span key={tag} className={styles.chip}>{tag}</span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
