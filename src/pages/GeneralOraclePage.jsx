import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUnifiedReading } from '../features/unified/useUnifiedReading';
import styles from './GeneralOraclePage.module.css';

const requirementMeta = {
  has_tarot: { label: 'Tarot', action: '/tarot', cta: 'Fazer leitura de tarot' },
  has_tarot_weekly: { label: 'Tarot semanal', action: '/tarot', cta: 'Fazer tarot semanal' },
  has_weekly_card: { label: 'Carta da Semana (tarot)', action: '/tarot', cta: 'Revelar carta da semana' },
  has_numerology: { label: 'Numerologia', action: '/numerologia', cta: 'Preencher numerologia' },
  has_numerology_weekly: { label: 'Numerologia semanal', action: '/numerologia', cta: 'Gerar numerologia semanal' },
  has_runes: { label: 'Runas', action: '/runas', cta: 'Gerar runas semanais' },
  has_runes_weekly: { label: 'Runas semanais', action: '/runas', cta: 'Gerar runas semanais' },
  has_iching: { label: 'I Ching', action: '/iching', cta: 'Gerar I Ching semanal' },
  has_iching_weekly: { label: 'I Ching semanal', action: '/iching', cta: 'Gerar I Ching semanal' },
};

const orderedKeys = [
  'has_weekly_card',
  'has_numerology_weekly',
  'has_runes_weekly',
  'has_iching_weekly',
  'has_tarot',
  'has_numerology',
  'has_runes',
  'has_iching',
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

  const requirementsChecklist = useMemo(() => {
    if (!requirements || typeof requirements !== 'object') return [];

    const entries = Object.entries(requirements)
      .filter(([key, value]) => key.startsWith('has_') && typeof value === 'boolean' && key !== 'has_natal_chart')
      .map(([key, value]) => ({
        key,
        done: value,
        label: requirementMeta[key]?.label || key.replace('has_', '').replace(/_/g, ' '),
        action: requirementMeta[key]?.action,
        cta: requirementMeta[key]?.cta || 'Completar requisito',
      }));

    return entries.sort((a, b) => {
      const indexA = orderedKeys.indexOf(a.key);
      const indexB = orderedKeys.indexOf(b.key);
      const safeA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
      const safeB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
      return safeA - safeB;
    });
  }, [requirements]);

  const pendingActions = requirementsChecklist.filter((item) => !item.done && item.action);
  const canGenerate = requirements?.can_generate_general_reading === true;

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (!canGenerate) return;

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
        <h1>Leitura Geral Semanal</h1>
        <p>Síntese central da semana com Tarot + Numerologia + Runas + I Ching.</p>
      </header>

      <section className={styles.card}>
        <h2>Checklist de requisitos</h2>
        {isLoadingRequirements && <p>Carregando requisitos...</p>}
        {!isLoadingRequirements && (
          <ul className={styles.checklist}>
            {requirementsChecklist.map((item) => (
              <li key={item.key}>
                <span>{item.label}</span>
                <strong>{item.done ? 'OK' : 'Pendente'}</strong>
              </li>
            ))}
          </ul>
        )}

        {!canGenerate && !isLoadingRequirements && (
          <div className={styles.requirementsWarning}>
            <p>Leitura semanal bloqueada até concluir todos os requisitos obrigatórios.</p>
            <div className={styles.actionsLinks}>
              {pendingActions.map((item) => (
                <Link key={item.key} to={item.action}>{item.cta}</Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className={styles.card}>
        <h2>Gerar Leitura Geral</h2>
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
          <button type="submit" disabled={!canGenerate || isGeneratingCentralReading || isLoadingRequirements}>
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
