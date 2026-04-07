import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GeneralReadingView from '../components/oracle/GeneralReadingView';
import { useUnifiedReading } from '../features/unified/useUnifiedReading';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import styles from './GeneralOraclePage.module.css';

const requirementMeta = {
  has_weekly_card: { label: 'Tarot', action: '/tarot', cta: 'Ir para Tarot' },
  has_numerology_weekly: { label: 'Numerologia', action: '/numerologia', cta: 'Ir para Numerologia' },
  has_runes_weekly: { label: 'Runas', action: '/runas', cta: 'Ir para Runas' },
  has_iching_weekly: { label: 'I Ching', action: '/iching', cta: 'Ir para I Ching' },
};

const fallbackActionOrder = ['/tarot', '/numerologia', '/runas', '/iching'];

const toList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\n|•|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const unwrapApiPayload = (payload) => payload?.data?.data ?? payload?.data ?? payload ?? null;

const normalizeUnifiedReadingsList = (payload) => {
  const normalized = unwrapApiPayload(payload);
  if (Array.isArray(normalized)) return normalized;
  return normalized?.items || normalized?.data || [];
};

const getWeekRefFromDate = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNumber = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const buildFallbackGeneralReading = ({ tarotCard, runesOutput, ichingOutput, numerologyOutput }) => {
  const runesHeadline = runesOutput?.headline || runesOutput?.summary;
  const ichingHeadline = ichingOutput?.headline || ichingOutput?.summary;
  const numerologyHeadline = numerologyOutput?.headline || numerologyOutput?.summary || numerologyOutput?.weekly_focus;
  const runesThemes = toList(runesOutput?.themes);
  const ichingThemes = toList(ichingOutput?.themes);
  const numerologyThemes = toList(numerologyOutput?.themes || numerologyOutput?.focus_points);
  const actionable = [
    ...toList(runesOutput?.recommended_actions),
    ...toList(ichingOutput?.recommended_actions),
    ...toList(numerologyOutput?.recommended_actions),
  ];

  const convergences = [...new Set([...runesThemes, ...ichingThemes, ...numerologyThemes])].slice(0, 5);
  const avoid = actionable
    .filter((item) => /evit|cuidado|nao|não/i.test(item))
    .slice(0, 4);
  const doList = actionable
    .filter((item) => !/evit|cuidado|nao|não/i.test(item))
    .slice(0, 5);

  const oneLiner = [
    runesHeadline,
    ichingHeadline,
    numerologyHeadline,
  ]
    .filter(Boolean)
    .join(' • ');

  return {
    title: 'Leitura Geral Integrada (Modo Estável)',
    one_liner: oneLiner || 'Síntese unificada da semana com os módulos disponíveis.',
    overview: [
      'Construímos esta leitura com os módulos semanais disponíveis no seu grimório para manter continuidade mesmo quando a geração central está instável.',
      'Use os sinais abaixo como bússola prática e volte a gerar a versão completa quando o serviço central estiver disponível.',
    ],
    signals: {
      tarot: tarotCard ? `Carta da semana: ${tarotCard}` : null,
      runes: runesHeadline || runesOutput?.summary || null,
      i_ching: ichingHeadline || ichingOutput?.summary || null,
      numerology: numerologyHeadline || null,
    },
    synthesis: {
      convergences,
      tensions: avoid.slice(0, 3),
      theme_of_week: convergences[0] || 'Integração e clareza',
      hidden_lesson: 'Evolução consistente nasce de pequenas ações coordenadas entre intenção, leitura simbólica e prática diária.',
    },
    practical_guidance: {
      do: doList.length ? doList : ['Revisar seus objetivos da semana e escolher 1 prioridade por dia.'],
      avoid: avoid.length ? avoid : ['Evitar decisões impulsivas sem revisão dos sinais dos oráculos.'],
      ritual: 'Reserve 15 minutos por dia para revisar seus sinais e ajustar o foco da semana.',
      reflection_question: 'Qual padrão se repete entre Tarot, Runas, I Ching e Numerologia nesta semana?',
    },
    closing: 'Esta versão estável garante continuidade. Quando o motor central estiver disponível, gere novamente para receber uma síntese aprofundada.',
    tags: convergences.slice(0, 4),
    energy_score: Math.min(100, 40 + (convergences.length * 10)),
  };
};

export default function GeneralOraclePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [generatedReading, setGeneratedReading] = useState(null);
  const [fallbackReading, setFallbackReading] = useState(null);
  const [uiError, setUiError] = useState('');

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

  const modulesQuery = useQuery({
    queryKey: ['general-oracle', 'fallback-modules', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const [modulesRes, weeklyCardRes, numerologyRes] = await Promise.all([
        supabase
          .from('oracle_weekly_modules')
          .select('oracle_type, output_payload, week_start, updated_at, status')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(30),
        supabase
          .from('weekly_cards')
          .select('card_name, week_start')
          .eq('user_id', user.id)
          .order('week_start', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('numerology_weekly_readings')
          .select('result_payload, week_start')
          .eq('user_id', user.id)
          .order('week_start', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (modulesRes.error) throw modulesRes.error;
      if (weeklyCardRes.error) throw weeklyCardRes.error;
      if (numerologyRes.error) throw numerologyRes.error;

      const modules = modulesRes.data || [];
      const runesModule = modules.find((item) => item.oracle_type === 'runes_weekly' && item.status === 'ok');
      const ichingModule = modules.find((item) => item.oracle_type === 'iching_weekly' && item.status === 'ok');

      return {
        runesOutput: runesModule?.output_payload || null,
        ichingOutput: ichingModule?.output_payload || null,
        tarotCard: weeklyCardRes.data?.card_name || null,
        numerologyOutput: numerologyRes.data?.result_payload || null,
        weekRef: getWeekRefFromDate(runesModule?.week_start || ichingModule?.week_start || weeklyCardRes.data?.week_start),
      };
    },
  });

  const getUiErrorMessage = useCallback((err) => (
    err?.message
    || err?.error?.message
    || 'Não foi possível gerar a Leitura Geral agora. Tente novamente.'
  ), []);

  const buildAndSetFallback = useCallback(() => {
    if (!modulesQuery.data) return false;
    const built = buildFallbackGeneralReading(modulesQuery.data);
    setFallbackReading({
      week_ref: modulesQuery.data.weekRef,
      final_reading: built,
      ai_failed: true,
      cached: true,
    });
    return true;
  }, [modulesQuery.data]);

  const loadCentralReading = useCallback(async () => {
    setUiError('');
    setFallbackReading(null);

    try {
      const response = await generateCentralReading({});
      const normalized = unwrapApiPayload(response);
      setGeneratedReading(normalized || null);
      if (!normalized?.final_reading && !normalized?.finalReading) {
        const fallbackBuilt = buildAndSetFallback();
        if (!fallbackBuilt) {
          setUiError('A leitura central respondeu sem conteúdo final e não havia dados suficientes para modo estável.');
        }
      }
    } catch (err) {
      setGeneratedReading(null);
      const fallbackBuilt = buildAndSetFallback();
      if (!fallbackBuilt) {
        setUiError(getUiErrorMessage(err));
      } else {
        setUiError('Serviço central indisponível. Exibindo leitura em modo estável com dados locais.');
      }
      console.error('Erro ao gerar Leitura Geral:', err);
    }
  }, [generateCentralReading, getUiErrorMessage, buildAndSetFallback]);

  const latestReadings = useMemo(() => {
    return normalizeUnifiedReadingsList(unifiedReadings);
  }, [unifiedReadings]);

  const detailReading = id ? unwrapApiPayload(unifiedReading) : null;
  const currentWeeklyReading = detailReading || generatedReading || fallbackReading || latestReadings?.[0] || null;
  const currentReading = currentWeeklyReading;
  const finalReading = currentReading?.final_reading || currentReading?.finalReading || null;

  const weekRef = currentReading?.week_ref || currentReading?.weekRef;
  const cached = currentReading?.cached === true;
  const aiFailed = currentReading?.ai_failed === true;

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
        <div className={styles.resultHeader}>
          <h2>Resultado da Semana</h2>
          {!id && canGenerate && (
            <button type="button" onClick={loadCentralReading} className={styles.retryButton}>
              {isGeneratingCentralReading ? 'Canalizando...' : 'Gerar Leitura Geral'}
            </button>
          )}
        </div>
        {(isGeneratingCentralReading || isLoadingUnifiedReading) && <p>Canalizando interpretação...</p>}
        {!isGeneratingCentralReading && uiError && canGenerate && (
          <div className={styles.errorCard} role="alert">
            <h3>Falha ao gerar leitura</h3>
            <p>{uiError}</p>
            <button type="button" onClick={loadCentralReading} className={styles.retryButton}>
              Tentar novamente
            </button>
          </div>
        )}
        {!uiError && !isGeneratingCentralReading && !finalReading && !id && canGenerate && (
          <div className={styles.errorCard} role="status">
            <h3>Pronto para gerar sua síntese</h3>
            <p>
              Gere sua Leitura Geral para combinar Tarot, Numerologia, Runas e I Ching em uma visão única da semana.
            </p>
          </div>
        )}
        {!isGeneratingCentralReading && !isLoadingUnifiedReading && !finalReading && !uiError && canGenerate && (
          <p>Não foi possível obter a leitura desta semana agora.</p>
        )}
        {aiFailed && finalReading && <p className={styles.stableModeHint}>Síntese gerada em modo estável</p>}
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
