import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import GeneralReadingView from '../components/oracle/GeneralReadingView';
import { useUnifiedReading } from '../features/unified/useUnifiedReading';
import styles from './GeneralOraclePage.module.css';

const requirementMeta = {
  has_weekly_card: { label: 'Tarot', action: '/tarot', cta: 'Ir para Tarot' },
  has_numerology_weekly: { label: 'Numerologia', action: '/numerologia', cta: 'Ir para Numerologia' },
  has_runes_weekly: { label: 'Runas', action: '/runas', cta: 'Ir para Runas' },
  has_iching_weekly: { label: 'I Ching', action: '/iching', cta: 'Ir para I Ching' },
};

const fallbackActionOrder = ['/tarot', '/numerologia', '/runas', '/iching'];

export default function GeneralOraclePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [generatedReading, setGeneratedReading] = useState(null);

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

  useEffect(() => {
    let mounted = true;

    if (id) return undefined;

    const loadCentralReading = async () => {
      try {
        const response = await generateCentralReading({});
        if (!mounted) return;
        setGeneratedReading(response || null);
      } catch {
        if (!mounted) return;
        setGeneratedReading(null);
      }
    };

    loadCentralReading();

    return () => {
      mounted = false;
    };
  }, [id, generateCentralReading]);

  const latestReadings = useMemo(() => {
    if (Array.isArray(unifiedReadings)) return unifiedReadings;
    return unifiedReadings?.items || unifiedReadings?.data || [];
  }, [unifiedReadings]);

  const detailReading = id ? unifiedReading : null;
  const currentReading = detailReading || generatedReading || latestReadings[0];
  const finalReading = currentReading?.final_reading || currentReading?.finalReading || null;

  const weekRef = currentReading?.week_ref || currentReading?.weekRef;
  const cached = currentReading?.cached === true;

  const canGenerate = currentReading?.can_generate ?? requirements?.can_generate_general_reading ?? true;

  const missingChecklist = useMemo(() => {
    if (!canGenerate) {
      const missingByFlags = Object.entries(requirementMeta)
        .filter(([key]) => requirements?.[key] === false)
        .map(([key, meta]) => ({ key, ...meta }));

      const rawMissing = Array.isArray(currentReading?.missing_requirements)
        ? currentReading.missing_requirements
        : [];

      const missingByResponse = rawMissing
        .map((item) => requirementMeta[item])
        .filter(Boolean)
        .map((meta) => ({ key: meta.label, ...meta }));

      const unique = new Map();
      [...missingByFlags, ...missingByResponse].forEach((item) => {
        unique.set(item.action, item);
      });

      if (unique.size > 0) return Array.from(unique.values());

      return fallbackActionOrder.map((action) => {
        const item = Object.values(requirementMeta).find((meta) => meta.action === action);
        return item || { label: action, action, cta: 'Completar requisito' };
      });
    }

    return [];
  }, [canGenerate, requirements, currentReading]);

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <h1>Leitura Geral Semanal</h1>
        <p>Síntese central da semana com Tarot + Numerologia + Runas + I Ching.</p>
        <div className={styles.statusRow}>
          <span className={styles.statusBadge}>Semanal • {weekRef || '—'}</span>
          {cached && <span className={styles.cachedBadge}>Já gerado nesta semana</span>}
        </div>
      </header>

      {!canGenerate && !isLoadingRequirements && (
        <section className={styles.card}>
          <h2>Requisitos pendentes</h2>
          <p>Conclua os oráculos semanais para liberar a leitura geral premium.</p>
          <ul className={styles.checklist}>
            {missingChecklist.map((item) => (
              <li key={`${item.label}-${item.action}`}>
                <span>{item.label}</span>
                <Link to={item.action}>{item.cta}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.card}>
        <h2>Resultado da semana</h2>
        {(isGeneratingCentralReading || isLoadingUnifiedReading) && <p>Canalizando interpretação...</p>}
        {!isGeneratingCentralReading && !isLoadingUnifiedReading && !finalReading && canGenerate && (
          <p>Não foi possível obter a leitura desta semana agora.</p>
        )}
        {finalReading && <GeneralReadingView finalReading={finalReading} />}
        {import.meta.env.DEV && currentReading && (
          <details className={styles.devRaw}>
            <summary>DEBUG (oculto): payload bruto</summary>
            <pre>{JSON.stringify(currentReading, null, 2)}</pre>
          </details>
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
