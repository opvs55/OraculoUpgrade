import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GeneralReadingView from '../components/oracle/GeneralReadingView';
import { useUnifiedReading } from '../features/unified/useUnifiedReading';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import DecorativeDivider from '../components/common/DecorativeDivider/DecorativeDivider';
import styles from './GeneralOraclePage.module.css';
import { usePageTitle } from '../hooks/usePageTitle';
import { getArcana, getYearArcana, getArcanaImageUrl } from '../utils/arcanaMap';

const ORACLE_MODULES = [
  {
    key: 'has_weekly_card',
    label: 'Carta da Semana',
    oracle: 'Tarot',
    description: 'A carta-foco que define a energia e o tema central desta semana.',
    action: '/tarot',
    cta: 'Fazer tiragem',
    icon: '✦',
  },
  {
    key: 'has_numerology_weekly',
    label: 'Numerologia Semanal',
    oracle: 'Numerologia',
    description: 'A vibração numérica da semana cruzada com seu caminho de vida.',
    action: '/numerologia',
    cta: 'Gerar vibração',
    icon: '◎',
  },
  {
    key: 'has_runes_weekly',
    label: 'Runas Semanais',
    oracle: 'Runas',
    description: 'O lançamento de runas revela forças, desafios e conselho para os dias.',
    action: '/runas',
    cta: 'Lançar runas',
    icon: '᛫',
  },
  {
    key: 'has_iching_weekly',
    label: 'I Ching Semanal',
    oracle: 'I Ching',
    description: 'O hexagrama da semana aponta o fluxo natural dos acontecimentos.',
    action: '/iching',
    cta: 'Consultar I Ching',
    icon: '☯',
  },
];

const requirementMeta = {
  has_weekly_card: { label: 'Tarot', action: '/tarot', cta: 'Ir para Tarot' },
  has_numerology_weekly: { label: 'Numerologia', action: '/numerologia', cta: 'Ir para Numerologia' },
  has_runes_weekly: { label: 'Runas', action: '/runas', cta: 'Ir para Runas' },
  has_iching_weekly: { label: 'I Ching', action: '/iching', cta: 'Ir para I Ching' },
};

const HOW_IT_WORKS = [
  {
    q: 'O que é a Síntese Integrada?',
    a: 'É uma leitura gerada por IA que cruza os resultados de Tarot, Numerologia, Runas e I Ching da semana. Em vez de ler cada oráculo isoladamente, a síntese identifica padrões comuns, tensões e convergências entre as quatro tradições — gerando uma orientação unificada e mais profunda.',
  },
  {
    q: 'Por que preciso completar os 4 oráculos?',
    a: 'Cada oráculo contribui com uma linguagem simbólica diferente: o Tarot fala em arquétipos visuais, a Numerologia em vibrações numéricas, as Runas em forças primordiais e o I Ching em fluxos e mudanças. Sem os 4, a síntese perde dimensões importantes. É como ler um mapa com partes faltando.',
  },
  {
    q: 'O que o Tarot traz para a síntese?',
    a: 'A carta semanal define o arquétipo central da semana — a energia dominante que colorirá suas decisões, relações e desafios. Ela funciona como o "tema" que os outros oráculos vão aprofundar ou contrastar.',
  },
  {
    q: 'O que a Numerologia contribui?',
    a: 'Além da vibração semanal, a síntese usa seu número do Caminho de Vida, o Arcano Pessoal e o Arcano do Ano para personalizar a leitura ao seu perfil energético único. A IA cruzará a vibração da semana com quem você é numerologicamente.',
  },
  {
    q: 'Como as Runas e o I Ching se integram?',
    a: 'As Runas trazem a perspectiva das forças em jogo — o que está ativo, o que resiste e o que precisa de atenção. O I Ching complementa com o fluxo temporal: o que está chegando, o que está passando e qual a postura ideal diante do momento. Juntos criam um conselho de ação concreto.',
  },
  {
    q: 'A síntese muda toda semana?',
    a: 'Sim. Cada semana você faz novas tiragens e a síntese reflete o momento atual. Leituras anteriores ficam salvas no histórico. O ciclo recomendado é: segunda-feira fazer as tiragens, gerar a síntese e usá-la como bússola até o domingo.',
  },
];

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

  const completedCount = ORACLE_MODULES.filter(m => requirements?.requirements_status?.[m.key] === true || requirements?.[m.key] === true).length;
  const totalModules = ORACLE_MODULES.length;
  const allComplete = completedCount === totalModules;

  const numerologyData = modulesQuery.data;
  const lifePathNumber = null; // enriquecimento futuro via numerology_readings join
  const yearArcana = getYearArcana(user?.created_at); // placeholder — idealmente virá do perfil

  return (
    <div className={`content_wrapper ${styles.page}`}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <p className={styles.eyebrow}>Oráculos</p>
        <h1>Síntese Integrada Semanal</h1>
        <p className={styles.subtitle}>
          A IA cruza Tarot, Numerologia, Runas e I Ching e entrega uma orientação unificada para sua semana.
        </p>
      </header>

      <DecorativeDivider />

      <section className={styles.card}>
        {/* ── Status badges ── */}
        <div className={styles.statusRow}>
          <span className={styles.badge}>Semana {weekRef || currentWeekRef}</span>
          {hasCurrentWeekReading && (
            <span className={styles.cachedBadge}>✓ Síntese gerada esta semana</span>
          )}
          <span className={styles.progressBadge}>
            {completedCount}/{totalModules} oráculos prontos
          </span>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className={styles.loadingBlock}>
            <p className={styles.loadingHint}>Carregando seus oráculos…</p>
          </div>
        )}

        {/* ── Checklist de módulos ── */}
        {!isLoading && (
          <div className={styles.modulesSection}>
            <div className={styles.modulesSectionHeader}>
              <div>
                <h2>{allComplete ? 'Todos os oráculos prontos' : `${completedCount} de ${totalModules} oráculos completos`}</h2>
                {!allComplete && (
                  <p className={styles.modulesHint}>
                    Complete os {totalModules} oráculos semanais para desbloquear sua síntese personalizada.
                  </p>
                )}
              </div>
              {/* Barra de progresso */}
              <div className={styles.progressTrack} aria-label={`${completedCount} de ${totalModules} completos`}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(completedCount / totalModules) * 100}%` }}
                />
              </div>
            </div>

            <div className={styles.modulesGrid}>
              {ORACLE_MODULES.map((mod) => {
                const done = requirements?.requirements_status?.[mod.key] === true || requirements?.[mod.key] === true;
                return (
                  <div key={mod.key} className={`${styles.moduleCard} ${done ? styles.moduleCardDone : ''}`}>
                    <div className={styles.moduleIcon}>{mod.icon}</div>
                    <div className={styles.moduleInfo}>
                      <p className={styles.moduleOracle}>{mod.oracle}</p>
                      <p className={styles.moduleLabel}>{mod.label}</p>
                      <p className={styles.moduleDesc}>{mod.description}</p>
                    </div>
                    <div className={styles.moduleStatus}>
                      {done
                        ? <span className={styles.moduleDone}>✓ Pronto</span>
                        : <Link to={mod.action} className={styles.moduleCta}>{mod.cta} →</Link>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Gerando ── */}
        {isGeneratingCentralReading && (
          <div className={styles.generatingCard}>
            <div className={styles.generatingSpinner} aria-hidden="true"><span>✦</span></div>
            <div className={styles.generatingText}>
              <p>Consultando os oráculos…</p>
              <small>A síntese integra Tarot, Runas, I Ching e Numerologia. Pode levar até 30 segundos.</small>
            </div>
          </div>
        )}

        {/* ── Erro ── */}
        {uiError && (
          <div className={styles.errorCard}>
            <h3>Aviso</h3>
            <p>{uiError}</p>
            <button type="button" onClick={loadCentralReading} className={styles.secondaryButton}>
              Tentar novamente
            </button>
          </div>
        )}

        {/* ── Síntese gerada ── */}
        {finalReading && (
          <div className={styles.resultBlock}>
            <div className={styles.resultHeader}>
              <h2>{finalReading.title || 'Síntese da Semana'}</h2>
              {canGenerate && !isGeneratingCentralReading && (
                <button type="button" onClick={loadCentralReading} className={styles.secondaryButton}>
                  Gerar nova síntese
                </button>
              )}
            </div>
            <GeneralReadingView finalReading={finalReading} />
          </div>
        )}

        {/* ── CTA para gerar ── */}
        {!finalReading && !isLoading && !isGeneratingCentralReading && allComplete && (
          <div className={styles.generateCta}>
            <p className={styles.loadingHint}>Todos os oráculos estão prontos. Gere sua síntese agora.</p>
            <button type="button" onClick={loadCentralReading} className={styles.primaryButton}>
              ✦ Gerar Síntese Integrada
            </button>
          </div>
        )}
      </section>

      {/* ── Histórico ── */}
      {latestReadings.length > 0 && (
        <section className={styles.card}>
          <h2>Histórico de Sínteses</h2>
          <ul className={styles.historyList}>
            {latestReadings.map((reading) => (
              <li key={reading.id}>
                <button type="button" onClick={() => navigate(`/oraculo/geral/${reading.id}`)}>
                  <span>{reading?.final_reading?.title || reading?.finalReading?.title || `Síntese ${reading.week_ref || reading.id}`}</span>
                  <span className={styles.historyWeek}>{reading.week_ref}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Como Funciona ── */}
      <section className={styles.card}>
        <h2 className={styles.howTitle}>Como funciona a Síntese Integrada</h2>
        <p className={styles.howSubtitle}>
          Cada oráculo fala uma linguagem simbólica diferente. A síntese é o momento em que todas conversam.
        </p>
        <div className={styles.faqList}>
          {HOW_IT_WORKS.map((item, i) => (
            <details key={i} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>{item.q}</summary>
              <p className={styles.faqAnswer}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

    </div>
  );
}
