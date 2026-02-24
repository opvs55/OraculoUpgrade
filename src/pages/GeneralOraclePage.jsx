import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUnifiedReading } from '../features/unified/useUnifiedReading';
import styles from './GeneralOraclePage.module.css';

const requirementsLabels = [
  { key: 'has_profile', label: 'Perfil', action: '/perfil/editar' },
  { key: 'has_natal_chart', label: 'Mapa Astral', action: '/mapa-astral' },
  { key: 'has_numerology', label: 'Numerologia', action: '/numerologia' },
  { key: 'has_weekly_card', label: 'Carta da Semana (opcional)', action: '/tarot' },
];

function FieldSection({ title, content }) {
  if (!content) return null;
  return (
    <section className={styles.resultSection}>
      <h3>{title}</h3>
      <p>{content}</p>
    </section>
  );
}

export default function GeneralOraclePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [focusArea, setFocusArea] = useState('geral');
  const [question, setQuestion] = useState('');

  const {
    requirements,
    isLoadingRequirements,
    generateCentralReading,
    isGeneratingCentralReading,
    unifiedReadings,
    isLoadingUnifiedReadings,
    unifiedReading,
    isLoadingUnifiedReading,
  } = useUnifiedReading({ readingId: id, listParams: { limit: 10 } });

  const latestReadings = useMemo(() => {
    if (Array.isArray(unifiedReadings)) return unifiedReadings;
    return unifiedReadings?.items || unifiedReadings?.data || [];
  }, [unifiedReadings]);

  const currentReading = id ? unifiedReading : latestReadings[0];
  const finalReading = currentReading?.final_reading || currentReading?.finalReading || currentReading;

  const canGenerate = requirements?.can_generate_general_reading !== false;

  const handleGenerate = async (event) => {
    event.preventDefault();
    const response = await generateCentralReading({
      focus_area: focusArea,
      question: question || undefined,
    });

    const readingId = response?.id || response?.reading_id;
    if (readingId) {
      navigate(`/oraculo/geral/${readingId}`);
      return;
    }

    navigate('/oraculo/geral');
  };

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <h1>Leitura Geral</h1>
        <p>Síntese central dos seus oráculos e dados já registrados no seu grimório.</p>
      </header>

      <section className={styles.card}>
        <h2>Checklist de requisitos</h2>
        {isLoadingRequirements && <p>Carregando requisitos...</p>}
        {!isLoadingRequirements && (
          <ul className={styles.checklist}>
            {requirementsLabels.map((item) => (
              <li key={item.key}>
                <span>{item.label}</span>
                <strong>{requirements?.[item.key] ? 'OK' : 'Pendente'}</strong>
              </li>
            ))}
          </ul>
        )}

        {!canGenerate && (
          <div className={styles.requirementsWarning}>
            <p>Você ainda não tem dados suficientes para gerar a Leitura Geral.</p>
            <div className={styles.actionsLinks}>
              <Link to="/mapa-astral">Completar mapa astral</Link>
              <Link to="/numerologia">Preencher numerologia</Link>
              <Link to="/tarot">Fazer leitura de tarot</Link>
            </div>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2>Gerar nova leitura</h2>
        <form className={styles.form} onSubmit={handleGenerate}>
          <label>
            Área de foco
            <select value={focusArea} onChange={(e) => setFocusArea(e.target.value)}>
              <option value="geral">Geral</option>
              <option value="amor">Amor</option>
              <option value="carreira">Carreira</option>
              <option value="espiritualidade">Espiritualidade</option>
            </select>
          </label>
          <label>
            Pergunta (opcional)
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex: O que devo priorizar nesta fase?"
            />
          </label>
          <button type="submit" disabled={!canGenerate || isGeneratingCentralReading}>
            {isGeneratingCentralReading ? 'Gerando...' : 'Gerar Leitura Geral'}
          </button>
        </form>
      </section>

      <section className={styles.card}>
        <h2>Resultado</h2>
        {(isLoadingUnifiedReading || isGeneratingCentralReading) && <p>Canalizando interpretação...</p>}
        {!isLoadingUnifiedReading && !finalReading && <p>Gere uma leitura para visualizar a síntese.</p>}
        {finalReading && (
          <div className={styles.resultWrapper}>
            <h3>{finalReading.title || 'Leitura Geral'}</h3>
            <FieldSection title="Visão geral" content={finalReading.overview} />
            <FieldSection title="Forças" content={finalReading.strengths} />
            <FieldSection title="Pontos de atenção" content={finalReading.cautions} />
            <FieldSection title="Direcionamento" content={finalReading.guidance} />
            <FieldSection title="Mensagem final" content={finalReading.closing_message} />
            {Array.isArray(finalReading.sources_used) && (
              <div className={styles.sources}>
                {finalReading.sources_used.map((source) => (
                  <span key={source}>{source}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2>Histórico recente</h2>
        {isLoadingUnifiedReadings && <p>Carregando histórico...</p>}
        {!isLoadingUnifiedReadings && latestReadings.length === 0 && <p>Nenhuma leitura geral encontrada.</p>}
        <ul className={styles.historyList}>
          {latestReadings.map((reading) => (
            <li key={reading.id}>
              <button type="button" onClick={() => navigate(`/oraculo/geral/${reading.id}`)}>
                {reading?.final_reading?.title || reading?.finalReading?.title || `Leitura ${reading.id}`}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
