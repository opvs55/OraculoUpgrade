import React from 'react';
import styles from './GeneralReadingView.module.css';
import { MAJOR_ARCANA, getArcanaImageUrl } from '../../utils/arcanaMap';

const POSITIVE_KEYWORDS = /colheit|crescimento|expans|alegr|clareza|vitória|sucesso|harmonia|abundânci|cura|renascimento|oportunidade|força|criação|realização|proteção|gratidão|fluxo|florescer/i;
const NEGATIVE_KEYWORDS = /cuidado|tensão|desafio|obstáculo|dificuldade|evit|pausa|ruptura|sombra|apego|ilusão|conflito|perda|estagnação|resistência|medo|bloqueio/i;

function getTextTone(text) {
  if (!text) return 'neutral';
  const posScore = (text.match(POSITIVE_KEYWORDS) || []).length;
  const negScore = (text.match(NEGATIVE_KEYWORDS) || []).length;
  if (posScore > negScore) return 'positive';
  if (negScore > posScore) return 'negative';
  return 'neutral';
}

function StyledText({ text, className = '' }) {
  if (!text) return null;
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return (
    <p className={`${styles.styledParagraph} ${className}`.trim()}>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <span key={i} className={styles.highlight}>{part}</span>
          : part
      )}
    </p>
  );
}

function resolveCardImg(cardName) {
  if (!cardName) return null;
  const normalized = cardName.toLowerCase();
  const arcana = MAJOR_ARCANA.find(
    a => a.name.toLowerCase() === normalized ||
         a.name.toLowerCase().includes(normalized) ||
         normalized.includes(a.name.toLowerCase())
  );
  return arcana ? getArcanaImageUrl(arcana.img) : null;
}

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

  const tarotRaw = signals?.tarot || '';
  const tarotCardName = finalReading?.tarot_card_name ||
    (tarotRaw ? tarotRaw.replace(/^Carta da semana:\s*/i, '').trim() : null);
  const tarotCardImg = resolveCardImg(tarotCardName);

  const isTarotLabelOnly = tarotRaw && tarotRaw.replace(/^Carta da semana:\s*/i, '').trim() === tarotRaw.trim();
  const tarotDisplayValue = tarotRaw.replace(/^Carta da semana:\s*/i, '').trim();

  const ABSENT_PATTERN = /sinal ausente|sem sinal|ausente nesta semana/i;

  const signalCards = [
    {
      key: 'tarot',
      title: 'Tarot',
      value: tarotRaw,
      displayValue: tarotDisplayValue,
      img: tarotCardImg,
      cardName: tarotCardName,
      labelOnly: tarotDisplayValue === tarotCardName,
    },
    { key: 'runes', title: 'Runas', value: signals?.runes, displayValue: signals?.runes },
    { key: 'i_ching', title: 'I Ching', value: signals?.i_ching, displayValue: signals?.i_ching },
    { key: 'numerology', title: 'Numerologia', value: signals?.numerology, displayValue: signals?.numerology },
  ].filter((item) => item.value && !ABSENT_PATTERN.test(item.value));

  return (
    <div className={styles.wrapper}>
      <Section delay="40ms" className={styles.headerBlock}>
        <h2>{finalReading?.title || 'Síntese Integrada Semanal'}</h2>
        {finalReading?.one_liner && <blockquote>“{finalReading.one_liner}”</blockquote>}
      </Section>

      <Section title="Visão Geral" delay="90ms">
        {Array.isArray(finalReading?.overview) ? (
          finalReading.overview.map((paragraph) => <StyledText key={paragraph} text={paragraph} className={styles.overviewPara} />)
        ) : (
          <StyledText text={finalReading?.overview} className={styles.overviewPara} />
        )}
      </Section>

      {signalCards.length > 0 && (
        <Section title="Sinais da Semana" delay="130ms">
          <div className={styles.signalsGrid}>
            {signalCards.map((signal, index) => {
              const tone = getTextTone(signal.value);
              return (
                <article
                  key={signal.key}
                  className={`${styles.signalCard} ${styles.appear} ${styles[`tone_${tone}`]} ${signal.labelOnly ? styles.signalCardCompact : ''}`}
                  style={{ '--d': `${180 + index * 70}ms` }}
                >
                  {signal.img ? (
                    <div className={styles.signalCardImg}>
                      <img src={signal.img} alt={signal.cardName} />
                    </div>
                  ) : (
                    <div className={styles.signalCardOrb}>
                      <span className={styles.signalCardOrbIcon}>
                        {signal.key === 'runes' ? 'ᚪ' : signal.key === 'i_ching' ? '☷' : signal.key === 'numerology' ? '✴' : '✦'}
                      </span>
                    </div>
                  )}
                  <div className={styles.signalCardBody}>
                    <h4 className={styles[`signalTitle_${tone}`]}>{signal.title}</h4>
                    {signal.labelOnly ? (
                      <p className={styles.signalCardArcana}>{signal.cardName}</p>
                    ) : (
                      <>
                        {signal.cardName && <p className={styles.cardNameLabel}>{signal.cardName}</p>}
                        <StyledText text={signal.displayValue} />
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="Síntese" delay="200ms">
        <div className={styles.doubleColumn}>
          <div className={`${styles.listBlock} ${styles.listBlockPositive}`}>
            {synthesis?.convergences?.length > 0 && (
              <><h4 className={styles.listTitlePositive}>✦ Convergências</h4>
              <ul>{synthesis.convergences.map(item => <li key={item}>{item}</li>)}</ul></>
            )}
          </div>
          <div className={`${styles.listBlock} ${styles.listBlockNegative}`}>
            {synthesis?.tensions?.length > 0 && (
              <><h4 className={styles.listTitleNegative}>⚡ Tensões</h4>
              <ul>{synthesis.tensions.map(item => <li key={item}>{item}</li>)}</ul></>
            )}
          </div>
        </div>
        {!synthesis?.convergences?.length && !synthesis?.tensions?.length && (
          <p className={styles.fallbackText}>
            Síntese em processamento. Use os sinais da semana para orientar suas escolhas com calma e consistência.
          </p>
        )}
        {synthesis?.theme_of_week && (
          <p className={styles.keyLine}>
            <span className={styles.keyLabel}>Tema da semana</span> {synthesis.theme_of_week}
          </p>
        )}
        {synthesis?.hidden_lesson && (
          <p className={styles.keyLine}>
            <span className={styles.keyLabel}>Lição oculta</span> {synthesis.hidden_lesson}
          </p>
        )}
      </Section>

      <Section title="Guia Prático" delay="240ms">
        <div className={styles.doubleColumn}>
          <div className={`${styles.listBlock} ${styles.listBlockPositive}`}>
            {practicalGuidance?.do?.length > 0 && (
              <><h4 className={styles.listTitlePositive}>✓ Faça</h4>
              <ul>{practicalGuidance.do.map(item => <li key={item}>{item}</li>)}</ul></>
            )}
          </div>
          <div className={`${styles.listBlock} ${styles.listBlockNegative}`}>
            {practicalGuidance?.avoid?.length > 0 && (
              <><h4 className={styles.listTitleNegative}>✕ Evite</h4>
              <ul>{practicalGuidance.avoid.map(item => <li key={item}>{item}</li>)}</ul></>
            )}
          </div>
        </div>
        {!practicalGuidance?.do?.length && !practicalGuidance?.avoid?.length && (
          <p className={styles.fallbackText}>
            Guia prático em construção. Foque em ações pequenas, revisão diária e uma decisão consciente por vez.
          </p>
        )}
        {practicalGuidance?.ritual && (
          <p className={styles.ritualLine}>
            <span className={styles.ritualIcon}>☽</span>
            <span><strong>Ritual:</strong> {practicalGuidance.ritual}</span>
          </p>
        )}
        {practicalGuidance?.reflection_question && (
          <blockquote className={styles.reflectionQuote}>
            {practicalGuidance.reflection_question}
          </blockquote>
        )}
      </Section>

      <Section title="Encerramento" delay="290ms">
        <StyledText text={finalReading?.closing} className={styles.closingText} />
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
