import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GeneralReadingView from '../components/oracle/GeneralReadingView';
import RequirementsCard from '../components/oracle/RequirementsCard';
import GeneratingState from '../components/oracle/GeneratingState';
import ErrorState from '../components/oracle/ErrorState';
import { useUnifiedReading } from '../features/unified/useUnifiedReading';
import { useReadingState } from '../hooks/useReadingState';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger.js';
import styles from './GeneralOraclePage.module.css';

const requirementMeta = {
  has_weekly_card: { label: 'Tarot', action: '/tarot', cta: 'Ir para Tarot' },
  has_numerology_weekly: { label: 'Numerologia', action: '/numerologia', cta: 'Ir para Numerologia' },
  has_runes_weekly: { label: 'Runas', action: '/runas', cta: 'Ir para Runas' },
  has_iching_weekly: { label: 'I Ching', action: '/iching', cta: 'Ir para I Ching' },
};

const fallbackActionOrder = ['/tarot', '/numerologia', '/runas', '/iching'];
const LOCAL_STORAGE_KEY_PREFIX = 'general-oracle-weekly';

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

const safeParseJson = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
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
    title: 'Síntese Integrada (Modo Estável)',
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
  const currentWeekRef = getWeekRefFromDate(new Date());
  const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}:${user?.id || 'guest'}:${currentWeekRef}`;

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

  // Estado unificado usando hook customizado
  const readingState = useReadingState({
    requirements,
    currentReading,
    isGenerating: isGeneratingCentralReading,
    isLoading: isLoadingUnifiedReadings,
    error: uiError,
    canGenerate
  });

  
  const loadCentralReading = useCallback(async () => {
    setUiError('');
    setFallbackReading(null);
    logger.auth.log('Iniciando geração da Síntese Integrada');

    try {
      const response = await generateCentralReading({});
      const normalized = unwrapApiPayload(response);
      setGeneratedReading(normalized || null);
      logger.auth.log('Síntese gerada com sucesso');
      
      if (!normalized?.final_reading && !normalized?.finalReading) {
        const fallbackBuilt = buildAndSetFallback();
        if (!fallbackBuilt) {
          setUiError('A leitura central respondeu sem conteúdo final e não havia dados suficientes para modo estável.');
        }
      }
    } catch (err) {
      logger.auth.error('Erro ao gerar Síntese Integrada:', err);
      setGeneratedReading(null);
      const fallbackBuilt = buildAndSetFallback();
      if (!fallbackBuilt) {
        setUiError(err?.message || 'Não foi possível gerar a Síntese Integrada agora. Tente novamente.');
      } else {
        setUiError('Serviço central indisponível. Exibindo leitura em modo estável com dados locais.');
      }
    }
  }, [generateCentralReading, buildAndSetFallback]);

  const latestReadings = useMemo(() => {
    return normalizeUnifiedReadingsList(unifiedReadings);
  }, [unifiedReadings]);

  const currentWeekReadingFromList = useMemo(() => (
    latestReadings.find((reading) => {
      const readingWeekRef = reading?.week_ref || reading?.weekRef;
      return readingWeekRef === currentWeekRef;
    }) || null
  ), [latestReadings, currentWeekRef]);

  const persistedWeeklyReading = useMemo(() => {
    if (!user?.id || id) return null;
    const saved = safeParseJson(window.localStorage.getItem(storageKey));
    if (!saved) return null;
    const savedWeekRef = saved?.week_ref || saved?.weekRef;
    const savedFinal = saved?.final_reading || saved?.finalReading;
    if (savedWeekRef !== currentWeekRef || !savedFinal) return null;
    return saved;
  }, [user?.id, id, storageKey, currentWeekRef]);

  const detailReading = id ? unwrapApiPayload(unifiedReading) : null;
  const currentWeeklyReading = detailReading
    || generatedReading
    || fallbackReading
    || currentWeekReadingFromList
    || persistedWeeklyReading
    || latestReadings?.[0]
    || null;
  const currentReading = currentWeeklyReading;
  const finalReading = currentReading?.final_reading || currentReading?.finalReading || null;

  const weekRef = currentReading?.week_ref || currentReading?.weekRef;
  const cached = currentReading?.cached === true;
  const aiFailed = currentReading?.ai_failed === true;
  const hasCurrentWeekReading = !id && weekRef === currentWeekRef && !!finalReading;

  const canGenerateByServer = currentReading?.can_generate ?? requirements?.can_generate_general_reading ?? true;
  const canGenerate = canGenerateByServer && !hasCurrentWeekReading;

  useEffect(() => {
    if (id || !user?.id || !hasCurrentWeekReading) return;
    window.localStorage.setItem(storageKey, JSON.stringify(currentReading));
  }, [id, user?.id, hasCurrentWeekReading, storageKey, currentReading]);

  
  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <h1>Síntese Integrada Semanal</h1>
        <p>Síntese central da semana com Tarot + Numerologia + Runas + I Ching.</p>
        <div className={styles.statusRow}>
          <span className={styles.statusBadge}>Semanal • {weekRef || '—'}</span>
          {cached && <span className={styles.cachedBadge}>Já gerado nesta semana</span>}
          {hasCurrentWeekReading && <span className={styles.cachedBadge}>Disponível novamente na próxima semana</span>}
        </div>
      </header>

      {/* Estado de Requisitos */}
      {readingState.hasRequirementsMissing && (
        <RequirementsCard 
          requirements={requirements} 
          missingChecklist={missingChecklist}
        />
      )}

      {/* Estado de Geração */}
      {readingState.isGenerating && (
        <GeneratingState message={readingState.stateMessage} />
      )}

      {/* Estado de Erro */}
      {readingState.isError && (
        <ErrorState 
          error={uiError}
          onRetry={loadCentralReading}
          onCheckRequirements={() => logger.auth.log('Redirecionando para requisitos')}
          onGoToReading={() => navigate('/tarot')}
          context={{ 
            hasRequirementsMissing: readingState.hasRequirementsMissing,
            isGenerationError: isGeneratingCentralReading 
          }}
        />
      )}

      {/* Resultado da Leitura */}
      {readingState.isSuccess && finalReading && (
        <section className={styles.card}>
          <div className={styles.resultHeader}>
            <h2>Resultado da Semana</h2>
            {!id && readingState.canProceed && (
              <button 
                type="button" 
                onClick={loadCentralReading} 
                className={styles.retryButton}
              >
                Gerar Nova Síntese
              </button>
            )}
          </div>
          <GeneralReadingView finalReading={finalReading} />
        </section>
      )}

      <section className={styles.card}>
        <h2>Histórico de sínteses</h2>
        {isLoadingUnifiedReadings && <p>Carregando histórico...</p>}
        {!isLoadingUnifiedReadings && latestReadings.length === 0 && <p>Nenhuma síntese integrada encontrada.</p>}
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
