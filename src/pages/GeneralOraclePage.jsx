import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GeneralReadingView from '../components/oracle/GeneralReadingView';
import { useUnifiedReading } from '../features/unified/useUnifiedReading';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import styles from './GeneralOraclePage.module.css';
import { usePageTitle } from '../hooks/usePageTitle';

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
  usePageTitle('Síntese Semanal');
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [generatedReading, setGeneratedReading] = useState(null);
  const [localFallback, setLocalFallback] = useState(null);
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
      };
    },
  });

  const latestReadings = useMemo(() => normalizeUnifiedReadingsList(unifiedReadings), [unifiedReadings]);

  const currentWeekReadingFromList = useMemo(() => (
    latestReadings.find((r) => (r?.week_ref || r?.weekRef) === currentWeekRef) || null
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
  const currentReading = detailReading
    || generatedReading
    || localFallback
    || currentWeekReadingFromList
    || persistedWeeklyReading
    || latestReadings?.[0]
    || null;

  const finalReading = currentReading?.final_reading || currentReading?.finalReading || null;
  const weekRef = currentReading?.week_ref || currentReading?.weekRef;
  const cached = currentReading?.cached === true;
  const hasCurrentWeekReading = !id && weekRef === currentWeekRef && !!finalReading;
  const canGenerateByServer = currentReading?.can_generate ?? requirements?.can_generate_general_reading ?? true;
  const canGenerate = canGenerateByServer && !hasCurrentWeekReading;

  const missingChecklist = useMemo(() => {
    if (!requirements?.requirements_status) return [];
    return Object.entries(requirementMeta)
      .filter(([key]) => requirements.requirements_status[key] === false)
      .map(([, meta]) => meta);
  }, [requirements]);

  const buildAndSetFallback = useCallback(() => {
    const modules = modulesQuery.data;
    if (!modules) return false;
    const built = buildFallbackGeneralReading(modules);
    setLocalFallback({ final_reading: built, week_ref: currentWeekRef, cached: false, ai_failed: true });
    return true;
  }, [modulesQuery.data, currentWeekRef]);

  const loadCentralReading = useCallback(async () => {
    setUiError('');
    setLocalFallback(null);

    try {
      const response = await generateCentralReading({ week_ref: currentWeekRef });
      const normalized = unwrapApiPayload(response);
      setGeneratedReading(normalized || null);

      if (!normalized?.final_reading && !normalized?.finalReading) {
        const built = buildAndSetFallback();
        if (!built) setUiError('Leitura central sem conteúdo e sem dados suficientes para modo estável.');
      }
    } catch (err) {
      setGeneratedReading(null);
      const built = buildAndSetFallback();
      if (!built) {
        setUiError(err?.message || 'Não foi possível gerar a Síntese Integrada agora. Tente novamente.');
      } else {
        setUiError('Serviço central indisponível. Exibindo leitura em modo estável com dados locais.');
      }
    }
  }, [generateCentralReading, buildAndSetFallback, currentWeekRef]);

  useEffect(() => {
    if (id || !user?.id || !hasCurrentWeekReading) return;
    window.localStorage.setItem(storageKey, JSON.stringify(currentReading));
  }, [id, user?.id, hasCurrentWeekReading, storageKey, currentReading]);

  const isLoading = isLoadingRequirements || isLoadingUnifiedReadings;

  return (
    <div className={`content_wrapper ${styles.page}`}>
      <header className={styles.header}>
        <h1>Síntese Integrada Semanal</h1>
        <p>Síntese central da semana com Tarot + Numerologia + Runas + I Ching.</p>
        <div className={styles.statusRow}>
          <span className={styles.statusBadge}>Semanal • {weekRef || currentWeekRef}</span>
          {cached && <span className={styles.cachedBadge}>Já gerado nesta semana</span>}
          {hasCurrentWeekReading && <span className={styles.cachedBadge}>Próxima disponível na virada da semana</span>}
        </div>
      </header>

      {isLoading && <p className={styles.stableModeHint}>Carregando...</p>}

      {!isLoading && missingChecklist.length > 0 && (
        <section className={styles.card}>
          <div className={styles.pendingHeader}>
            <span className={styles.pendingIcon}>◎</span>
            <div>
              <h2>Quase lá — {4 - missingChecklist.length} de 4 oráculos prontos</h2>
              <p className={styles.stableModeHint}>
                Complete os oráculos abaixo para desbloquear sua síntese personalizada da semana.
                Cada um leva menos de um minuto.
              </p>
            </div>
          </div>
          <ul className={styles.checklist}>
            {missingChecklist.map((item) => (
              <li key={item.action}>
                <span className={styles.checklistLabel}>⊕ {item.label}</span>
                <Link to={item.action} className={styles.checklistCta}>{item.cta} →</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isGeneratingCentralReading && (
        <section className={`${styles.card} ${styles.generatingCard}`}>
          <div className={styles.generatingSpinner} aria-hidden="true">
            <span>✦</span>
          </div>
          <div className={styles.generatingText}>
            <p>Consultando os oráculos…</p>
            <small>A síntese integra Tarot, Runas, I Ching e Numerologia. Pode levar até 30 segundos.</small>
          </div>
        </section>
      )}

      {uiError && (
        <section className={`${styles.card} ${styles.errorCard}`}>
          <h3>Aviso</h3>
          <p>{uiError}</p>
          <button type="button" onClick={loadCentralReading} className={styles.retryButton}>
            Tentar novamente
          </button>
        </section>
      )}

      {finalReading && (
        <section className={styles.card}>
          <div className={styles.resultHeader}>
            <h2>{finalReading.title || 'Síntese da Semana'}</h2>
            {canGenerate && !isGeneratingCentralReading && (
              <button type="button" onClick={loadCentralReading} className={styles.retryButton}>
                Gerar nova síntese
              </button>
            )}
          </div>
          <GeneralReadingView finalReading={finalReading} />
        </section>
      )}

      {!finalReading && !isLoading && !isGeneratingCentralReading && (
        <section className={styles.card}>
          <h2>Gerar Síntese Integrada</h2>
          <p className={styles.stableModeHint}>
            Integra todos os seus oráculos da semana em uma leitura unificada e personalizada.
          </p>
          <button
            type="button"
            onClick={loadCentralReading}
            className={styles.retryButton}
            disabled={!canGenerate}
          >
            {isGeneratingCentralReading ? '✦ Gerando...' : 'Gerar síntese desta semana'}
          </button>
        </section>
      )}

      {latestReadings.length > 0 && (
        <section className={styles.card}>
          <h2>Histórico de sínteses</h2>
          <ul className={styles.historyList}>
            {latestReadings.map((reading) => (
              <li key={reading.id}>
                <button type="button" onClick={() => navigate(`/oraculo/geral/${reading.id}`)}>
                  {reading?.final_reading?.title || reading?.finalReading?.title || `Síntese ${reading.week_ref || reading.id}`}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
